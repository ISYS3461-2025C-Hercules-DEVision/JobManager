package com.job.manager.company.config;

import lombok.Getter;
import okhttp3.OkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuration for Supabase Storage integration.
 * 
 * This configuration class sets up the connection to Supabase Storage,
 * which is used for storing and managing company media files (images and videos).
 * 
 * Required Supabase setup:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Navigate to Storage in the dashboard
 * 3. Create a storage bucket (e.g., "company-media")
 * 4. Set bucket policy to "public" or configure RLS policies
 * 5. Get your project URL and service_role key from Settings > API
 * 6. Add these values to application.yml
 * 
 * Environment variables needed:
 * - supabase.url: Your Supabase project URL (e.g., https://xxxxx.supabase.co)
 * - supabase.api-key: Your Supabase service_role key (for backend operations)
 * - supabase.bucket-name: The name of your storage bucket
 */
@Configuration
@Getter
public class SupabaseConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api-key}")
    private String apiKey;

    @Value("${supabase.bucket-name}")
    private String bucketName;

    /**
     * Creates an OkHttpClient bean for making HTTP requests to Supabase Storage.
     * 
     * The client is configured with reasonable timeouts for file upload operations:
     * - Connect timeout: 30 seconds
     * - Write timeout: 60 seconds (for large file uploads)
     * - Read timeout: 30 seconds
     * 
     * @return Configured OkHttpClient instance
     */
    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    /**
     * Gets the base URL for the Supabase Storage API.
     * 
     * @return The full storage API endpoint URL
     */
    public String getStorageUrl() {
        return supabaseUrl + "/storage/v1/object/" + bucketName;
    }

    /**
     * Gets the public URL prefix for accessing uploaded files.
     * 
     * @return The public URL prefix for the bucket
     */
    public String getPublicUrl() {
        return supabaseUrl + "/storage/v1/object/public/" + bucketName;
    }
}
