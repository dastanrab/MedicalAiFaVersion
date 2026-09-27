package ai.medira.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // اندازه‌ی فونت سیستم گوشی روی متن‌های WebView اعمال نشود تا ظاهر برنامه به‌هم نریزد
        getBridge().getWebView().getSettings().setTextZoom(100);
    }
}
