# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep WebView JavaScript Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView related classes
-keep class android.webkit.** { *; }
-keep class androidx.webkit.** { *; }

# Keep MainActivity and its methods
-keep class com.bife.MainActivity { *; }

# Keep all public methods that might be called from JavaScript
-keepclassmembers class com.bife.MainActivity {
    public *;
}

# Keep model classes for JSON serialization
-keep class * implements android.os.Parcelable { *; }

# Keep all enum classes
-keepclassmembers enum * { *; }

# Prevent obfuscation of line numbers for crash reports
-keepattributes SourceFile,LineNumberTable

# Keep all annotations
-keepattributes *Annotation*
