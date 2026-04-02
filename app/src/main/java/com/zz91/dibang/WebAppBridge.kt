package com.zz91.dibang

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast

class WebAppBridge(
    private val activity: Activity,
    private val webView: WebView
) {
    private val mainHandler = Handler(Looper.getMainLooper())

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
}
