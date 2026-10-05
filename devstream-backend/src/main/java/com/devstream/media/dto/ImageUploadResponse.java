package com.devstream.media.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageUploadResponse {
    private String url;
    private String publicId;
    private String format;
    private Long bytes;
    private Integer width;
    private Integer height;
}
