package com.devstream.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.devstream.media.dto.ImageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryMediaService {

    private final Cloudinary cloudinary;

    public ImageUploadResponse uploadImage(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files (JPEG, PNG, WebP, GIF) are allowed");
        }

        try {
            String targetFolder = folder != null && !folder.isBlank() ? "devstream/" + folder : "devstream/articles";

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", targetFolder,
                    "overwrite", true,
                    "resource_type", "auto"
            ));

            return ImageUploadResponse.builder()
                    .url((String) uploadResult.get("secure_url"))
                    .publicId((String) uploadResult.get("public_id"))
                    .format((String) uploadResult.get("format"))
                    .bytes(uploadResult.get("bytes") != null ? ((Number) uploadResult.get("bytes")).longValue() : 0L)
                    .width(uploadResult.get("width") != null ? ((Number) uploadResult.get("width")).intValue() : 0)
                    .height(uploadResult.get("height") != null ? ((Number) uploadResult.get("height")).intValue() : 0)
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary: " + e.getMessage(), e);
        }
    }
}
