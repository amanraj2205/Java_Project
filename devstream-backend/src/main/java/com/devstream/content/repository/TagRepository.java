package com.devstream.content.repository;

import com.devstream.content.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagRepository extends MongoRepository<Tag, String> {
    Optional<Tag> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    void deleteByNameIgnoreCase(String name);
}
