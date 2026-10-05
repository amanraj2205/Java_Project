package com.devstream.content.controller;

import com.devstream.content.model.Tag;
import com.devstream.content.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagRepository tagRepository;

    /**
     * Public feed of curated tags (Accessible to GUEST and all users).
     */
    @GetMapping
    public ResponseEntity<List<Tag>> getAllTags() {
        return ResponseEntity.ok(tagRepository.findAll());
    }

    /**
     * Create global tag: Restricted to ROLE_MODERATOR.
     */
    @PostMapping
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Tag> createTag(@RequestBody Tag tag) {
        if (tagRepository.existsByNameIgnoreCase(tag.getName())) {
            return ResponseEntity.badRequest().build();
        }
        Tag saved = tagRepository.save(tag);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Delete global tag: Restricted to ROLE_MODERATOR.
     */
    @DeleteMapping("/{name}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<Void> deleteTag(@PathVariable String name) {
        tagRepository.deleteByNameIgnoreCase(name);
        return ResponseEntity.noContent().build();
    }
}
