package com.zz91.dibang

import android.Manifest
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.core.app.ActivityCompat
import org.json.JSONObject
import java.io.OutputStream
import java.net.InetSocketAddress
import java.net.Socket
import java.util.UUID

class WebAppBridge(
    private val activity: Activity,
    private val webView: WebView
) {
    private val mainHandler = Handler(Looper.getMainLooper())
    private val prefs = activity.getSharedPreferences("dibang_runtime_config", Context.MODE_PRIVATE)
    private val printerUuid: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    @JavascriptInterface
    fun toast(message: String?) {
        val text = message?.takeIf { it.isNotBlank() } ?: return
        mainHandler.post {
            Toast.makeText(activity, text, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun closeApp() {
        mainHandler.post {
            activity.finish()
        }
    }

    @JavascriptInterface
    fun reload() {
        mainHandler.post {
            webView.reload()
        }
    }

    @JavascriptInterface
    fun getDiBangConfig(): String {
        val defaultIp = readConfigPreference("diBangIp", "192.168.1.100")
        val defaultCom = readConfigPreference("diBangCom", "COM0")
        val ip = prefs.getString("diBangIp", defaultIp).orEmpty()
        val com = prefs.getString("diBangCom", defaultCom).orEmpty()
        return JSONObject()
            .put("diBangIp", ip)
            .put("diBangCom", com)
            .toString()
    }

    @JavascriptInterface
    fun saveDiBangConfig(diBangIp: String?, diBangCom: String?): Boolean {
        val ip = diBangIp?.trim().orEmpty()
        val com = diBangCom?.trim().orEmpty()
        if (ip.isBlank() || com.isBlank()) {
            return false
        }
        return prefs.edit()
            .putString("diBangIp", ip)
            .putString("diBangCom", com)
            .commit()
    }

    @JavascriptInterface
    fun getPrinterConfig(): String {
        return getPrinterConfigObject().toString()
    }

    @JavascriptInterface
    fun savePrinterConfig(
        connectionType: String?,
        bluetoothAddress: String?,
        networkIp: String?,
        networkPort: String?
    ): Boolean {
        val type = connectionType?.trim()?.lowercase().orEmpty()
        val btAddress = bluetoothAddress?.trim().orEmpty()
        val ip = networkIp?.trim().orEmpty()
        val port = networkPort?.trim().orEmpty().toIntOrNull() ?: 9100
        if (type != "bluetooth" && type != "network" && type != "wifi") {
            return false
        }
        if (type == "bluetooth" && btAddress.isBlank()) {
            return false
        }
        if ((type == "network" || type == "wifi") && ip.isBlank()) {
            return false
        }
        return prefs.edit()
            .putString("printerType", "Xprinter")
            .putString("printerConnectionType", type)
            .putString("printerBluetoothAddress", btAddress)
            .putString("printerNetworkIp", ip)
            .putInt("printerNetworkPort", port)
            .commit()
    }

    private fun readConfigPreference(name: String, fallback: String): String {
        return runCatching {
            val content = activity.assets.open("widget/config.xml").bufferedReader().use { it.readText() }
            val regex = Regex("<preference\\s+name=\"$name\"\\s+value=\"([^\"]*)\"\\s*/?>")
            regex.find(content)?.groupValues?.getOrNull(1)?.takeIf { it.isNotBlank() } ?: fallback
        }.getOrDefault(fallback)
    }

    private fun getPrinterConfigObject(): JSONObject {
        return JSONObject()
            .put("printerType", "Xprinter")
            .put("connectionType", prefs.getString("printerConnectionType", "bluetooth").orEmpty())
            .put("bluetoothAddress", prefs.getString("printerBluetoothAddress", "").orEmpty())
            .put("networkIp", prefs.getString("printerNetworkIp", "").orEmpty())
            .put("networkPort", prefs.getInt("printerNetworkPort", 9100))
    }

    @JavascriptInterface
    fun printTestReceipt(payloadJson: String?): String {
        val result = JSONObject()
        try {
            val printerConfig = getPrinterConfigObject()
            val connectionType = printerConfig.optString("connectionType", "bluetooth")
            val payload = payloadJson?.takeIf { it.isNotBlank() }?.let { JSONObject(it) } ?: JSONObject()
            val content = buildReceiptText(payload)
            if (connectionType == "network" || connectionType == "wifi") {
                val ip = printerConfig.optString("networkIp")
                val port = printerConfig.optInt("networkPort", 9100)
                if (ip.isBlank()) {
                    return result.put("success", false).put("message", "请先配置WiFi打印机 IP").toString()
                }
                Socket().use { socket ->
                    socket.connect(InetSocketAddress(ip, port), 5000)
                    socket.outputStream.use { outputStream ->
                        writeReceipt(outputStream, content)
                    }
                }
                return result.put("success", true).put("message", "打印任务已发送到 $ip:$port").toString()
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                ActivityCompat.checkSelfPermission(activity, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED
            ) {
                mainHandler.post {
                    ActivityCompat.requestPermissions(
                        activity,
                        arrayOf(Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN),
                        2001
                    )
                }
                return result.put("success", false).put("message", "请先授予蓝牙权限后重试").toString()
            }
            val adapter = BluetoothAdapter.getDefaultAdapter()
                ?: return result.put("success", false).put("message", "当前设备不支持蓝牙打印").toString()
            if (!adapter.isEnabled) {
                return result.put("success", false).put("message", "请先打开手机蓝牙").toString()
            }
            val device = findPrinterDevice(
                adapter.bondedDevices,
                printerConfig.optString("bluetoothAddress")
            ) ?: return result.put("success", false).put("message", "未找到已配对的芯烨蓝牙打印机").toString()
            val socket = device.createRfcommSocketToServiceRecord(printerUuid)
            adapter.cancelDiscovery()
            socket.connect()
            socket.outputStream.use { outputStream ->
                writeReceipt(outputStream, content)
            }
            socket.close()
            return result.put("success", true).put("message", "打印任务已发送到 ${device.name ?: device.address}").toString()
        } catch (e: Exception) {
            return result.put("success", false).put("message", e.message ?: "打印失败，请检查蓝牙打印机连接").toString()
        }
    }

    private fun findPrinterDevice(devices: Set<BluetoothDevice>, bluetoothAddress: String): BluetoothDevice? {
        if (devices.isEmpty()) {
            return null
        }
        val normalizedAddress = bluetoothAddress.trim().uppercase()
        if (normalizedAddress.isNotBlank()) {
            val exact = devices.firstOrNull { it.address?.uppercase() == normalizedAddress }
            if (exact != null) {
                return exact
            }
        }
        val preferred = devices.firstOrNull {
            val name = it.name?.lowercase().orEmpty()
            name.contains("xprinter") || name.contains("xp-") || name.contains("printer")
        }
        return preferred ?: devices.firstOrNull()
    }

    private fun buildReceiptText(payload: JSONObject): String {
        val orderNo = payload.optString("orderNo")
        val productName = payload.optString("productName")
        val supplierName = payload.optString("supplierName")
        val quantity = payload.optString("quantity")
        val price = payload.optString("price")
        val amount = payload.optString("amount")
        val payType = payload.optString("payType")
        val payTime = payload.optString("payTime")
        val remark = payload.optString("remark")
        return buildString {
            appendLine("      智慧农业管理")
            appendLine("      测试订单小票")
            appendLine("--------------------------------")
            appendLine("订单号: $orderNo")
            appendLine("产品名称: $productName")
            appendLine("供应商: $supplierName")
            appendLine("数量: $quantity")
            appendLine("单价: $price")
            appendLine("金额: $amount")
            appendLine("支付方式: $payType")
            appendLine("支付时间: $payTime")
            appendLine("备注: $remark")
            appendLine("--------------------------------")
            appendLine("打印时间: ${System.currentTimeMillis()}")
            appendLine("")
            appendLine("")
        }
    }

    private fun writeReceipt(outputStream: OutputStream, content: String) {
        outputStream.write(byteArrayOf(0x1B, 0x40))
        outputStream.write(content.toByteArray(Charsets.UTF_8))
        outputStream.write(byteArrayOf(0x0A, 0x0A, 0x0A))
        outputStream.write(byteArrayOf(0x1D, 0x56, 0x42, 0x00))
        outputStream.flush()
    }
}
