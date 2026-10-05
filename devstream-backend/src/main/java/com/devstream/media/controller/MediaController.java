package com.devstream.media.controller;

import com.devstream.media.dto.ImageUploadResponse;
import com.devstream.media.service.CloudinaryMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {

    private final CloudinaryMediaService mediaService;

    /**
     * Cloudinary Image Upload Endpoint: Restricted to STUDENT_AUTHOR and MODERATOR.
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('STUDENT_AUTHOR', 'MODERATOR')")
    public ResponseEntity<ImageUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "articles") String folder) {
        ImageUploadResponse response = mediaService.uploadImage(file, folder);
        return ResponseEntity.ok(response);
    }
}
