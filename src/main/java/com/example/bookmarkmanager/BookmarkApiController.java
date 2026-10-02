package com.example.bookmarkmanager;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkApiController {
    private final BookmarkRepository repository;

    public BookmarkApiController(BookmarkRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Bookmark> getBookmarks() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Bookmark createBookmark(@Valid @RequestBody Bookmark bookmark) {
        bookmark.setId(null);
        return repository.save(bookmark);
    }

    @PutMapping("/{id}")
    public Bookmark updateBookmark(@PathVariable Long id, @Valid @RequestBody Bookmark changes) {
        Bookmark bookmark = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        bookmark.setTitle(changes.getTitle());
        bookmark.setUrl(changes.getUrl());
        bookmark.setCategory(changes.getCategory());
        bookmark.setTag(changes.getTag());
        bookmark.setFavorite(changes.isFavorite());
        return repository.save(bookmark);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBookmark(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        repository.deleteById(id);
    }
}