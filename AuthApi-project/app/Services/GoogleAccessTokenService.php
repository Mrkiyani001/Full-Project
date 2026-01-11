<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class GoogleAccessTokenService
{
    /**
     * Get OAuth2 Access Token for Firebase FCM V1
     */
    public static function getToken()
    {
        $credentials = null;

        // Try building from ENV variables (Only 3 essential fields)
        if (env('FIREBASE_PROJECT_ID') && env('FIREBASE_CLIENT_EMAIL') && env('FIREBASE_PRIVATE_KEY')) {
            $credentials = [
                'project_id' => env('FIREBASE_PROJECT_ID'),
                'client_email' => env('FIREBASE_CLIENT_EMAIL'),
                'private_key' => env('FIREBASE_PRIVATE_KEY')
            ];
            Log::info('Firebase: Using credentials from ENV variables');
        }

        if (!$credentials) {
            Log::error("Firebase Credentials not found. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to .env");
            return null;
        }

        $header = ['alg' => 'RS256', 'typ' => 'JWT'];
        $now = time();
        $payload = [
            'iss' => $credentials['client_email'],
            'sub' => $credentials['client_email'],
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging'
        ];

        $jwt = self::encodeJwt($header, $payload, $credentials['private_key']);

        // Exchange JWT for Access Token
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            Log::error("Google Auth Error ($httpCode): " . $response);
            return null;
        }

        $data = json_decode($response, true);
        return $data['access_token'] ?? null;
    }

    private static function encodeJwt($header, $payload, $privateKey)
    {
        $base64UrlHeader = self::base64UrlEncode(json_encode($header));
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        $signatureInput = $base64UrlHeader . "." . $base64UrlPayload;

        $signature = '';
        if (!openssl_sign($signatureInput, $signature, $privateKey, 'SHA256')) {
            throw new Exception("Failed to sign JWT");
        }

        $base64UrlSignature = self::base64UrlEncode($signature);
        return $signatureInput . "." . $base64UrlSignature;
    }

    private static function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }
}
