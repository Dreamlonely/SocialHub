package com.socialhub.socialhub_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve images stored in the uploads/images folder located at the root of your project
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:./uploads/images/"); // The relative path to the uploads/images directory
    }
}