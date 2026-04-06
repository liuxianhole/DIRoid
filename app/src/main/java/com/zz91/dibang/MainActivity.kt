package com.zz91.dibang

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.ConsoleMessage
import android.webkit.JsResult
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import com.zz91.dibang.databinding.ActivityMainBinding
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
    private lateinit var webAppBridge: WebAppBridge

    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val callback = fileChooserCallback
            fileChooserCallback = null
            if (callback == null) {
                return@registerForActivityResult
            }

            if (result.resultCode != Activity.RESULT_OK) {
                callback.onReceiveValue(null)
                return@registerForActivityResult
            }

            val data = result.data
            val results = WebChromeClient.FileChooserParams.parseResult(result.resultCode, data)
            callback.onReceiveValue(results)
        }

    private val scanLauncher = registerForActivityResult(ScanContract()) { result ->
        val payload = JSONObject()
        if (result.contents.isNullOrBlank()) {
            payload.put("ret", JSONObject().put("eventType", "cancel"))
        } else {
            payload.put(
                "ret",
                JSONObject()
                    .put("eventType", "success")
                    .put("content", result.contents)
            )
        }
        dispatchScanResult(payload.toString())
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        with(binding.webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = false
            loadsImagesAutomatically = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            builtInZoomControls = false
            displayZoomControls = false
            setSupportZoom(false)
        }

        WebView.setWebContentsDebuggingEnabled(true)
        webAppBridge = WebAppBridge(this, binding.webView)
        binding.webView.addJavascriptInterface(webAppBridge, "AndroidBridge")
        binding.webView.webViewClient = AppWebViewClient()
        binding.webView.webChromeClient = AppWebChromeClient()
        binding.webView.loadUrl(APP_ENTRY_URL)

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    binding.webView.evaluateJavascript(
                        "(function(){return window.__apiCompatHandleBack ? window.__apiCompatHandleBack() : false;})()"
                    ) { handled ->
                        if (handled == "true") {
                            return@evaluateJavascript
                        }
                        if (binding.webView.canGoBack()) {
                            binding.webView.goBack()
                        } else {
                            finish()
                        }
                    }
                }
            }
        )
    }

    override fun onDestroy() {
        fileChooserCallback?.onReceiveValue(null)
        fileChooserCallback = null
        binding.webView.removeJavascriptInterface("AndroidBridge")
        binding.webView.destroy()
        super.onDestroy()
    }

    fun openScanner(): Boolean {
        return try {
            val options = ScanOptions().apply {
                setDesiredBarcodeFormats(ScanOptions.QR_CODE)
                setPrompt("请扫描订单二维码")
                setBeepEnabled(false)
                setCaptureActivity(PortraitCaptureActivity::class.java)
                setOrientationLocked(true)
                setBarcodeImageEnabled(false)
            }
            scanLauncher.launch(options)
            true
        } catch (_: Exception) {
            false
        }
    }

    fun closeScanner() {
        // zxing scanner activity closes itself after success/cancel.
    }

    private fun dispatchScanResult(payload: String) {
        val escapedPayload = JSONObject.quote(payload)
        binding.webView.post {
            binding.webView.evaluateJavascript(
                "(function(){if(window.__apiCompatHandleScanResult){window.__apiCompatHandleScanResult($escapedPayload);}})();",
                null
            )
        }
    }

    private inner class AppWebViewClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
            val uri = request?.url ?: return false
            val scheme = uri.scheme?.lowercase().orEmpty()
            if (scheme == "http" || scheme == "https" || scheme == "file") {
                return false
            }

            return try {
                startActivity(Intent(Intent.ACTION_VIEW, uri))
                true
            } catch (_: ActivityNotFoundException) {
                false
            }
        }
    }

    private inner class AppWebChromeClient : WebChromeClient() {
        override fun onShowFileChooser(
            webView: WebView?,
            filePathCallback: ValueCallback<Array<Uri>>?,
            fileChooserParams: FileChooserParams?
        ): Boolean {
            if (filePathCallback == null) {
                return false
            }

            fileChooserCallback?.onReceiveValue(null)
            fileChooserCallback = filePathCallback

            val chooserIntent = try {
                fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }
            } catch (_: Exception) {
                Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }
            }

            return try {
                fileChooserLauncher.launch(chooserIntent)
                true
            } catch (_: ActivityNotFoundException) {
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = null
                false
            }
        }

        override fun onPermissionRequest(request: PermissionRequest?) {
            request?.grant(request.resources)
        }

        override fun onJsAlert(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
            AlertDialog.Builder(this@MainActivity)
                .setMessage(message ?: "")
                .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm() }
                .setOnCancelListener { result?.cancel() }
                .show()
            return true
        }

        override fun onJsConfirm(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
            AlertDialog.Builder(this@MainActivity)
                .setMessage(message ?: "")
                .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm() }
                .setNegativeButton(android.R.string.cancel) { _, _ -> result?.cancel() }
                .setOnCancelListener { result?.cancel() }
                .show()
            return true
        }

        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            return super.onConsoleMessage(consoleMessage)
        }
    }

    companion object {
        private const val APP_ENTRY_URL = "file:///android_asset/widget/html/new/index.html"
    }
}
