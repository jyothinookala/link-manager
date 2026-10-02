package com.example.bookmarkmanager;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class BookmarkController {
    private final BookmarkRepository repository;

    public BookmarkController(BookmarkRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/")
    public String home(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(required = false) Long edit,
            Model model) {
        Bookmark formBookmark = edit == null
                ? new Bookmark()
                : repository.findById(edit).orElseGet(Bookmark::new);
        boolean editing = formBookmark.getId() != null;
        addPageData(model, query, category, formBookmark, editing, editing);
        return "index";
    }

    @PostMapping("/bookmarks")
    public String saveBookmark(
            @RequestParam(required = false) Long id,
            @Valid @ModelAttribute("bookmark") Bookmark formBookmark,
            BindingResult bindingResult,
            Model model) {
        boolean editing = id != null;
        if (bindingResult.hasErrors()) {
            addPageData(model, "", "all", formBookmark, editing, true);
            return "index";
        }

        if (!editing) {
            formBookmark.setId(null);
            repository.save(formBookmark);
        } else {
            Bookmark bookmark = repository.findById(id).orElse(null);
            if (bookmark == null) {
                return "redirect:/";
            }
            bookmark.setTitle(formBookmark.getTitle());
            bookmark.setUrl(formBookmark.getUrl());
            bookmark.setCategory(formBookmark.getCategory());
            bookmark.setTag(formBookmark.getTag());
            repository.save(bookmark);
        }
        return "redirect:/";
    }

    @PostMapping("/bookmarks/{id}/favorite")
    public String toggleFavorite(@PathVariable Long id) {
        repository.findById(id).ifPresent(bookmark -> {
            bookmark.setFavorite(!bookmark.isFavorite());
            repository.save(bookmark);
        });
        return "redirect:/";
    }

    @PostMapping("/bookmarks/{id}/delete")
    public String deleteBookmark(@PathVariable Long id) {
        repository.findById(id).ifPresent(repository::delete);
        return "redirect:/";
    }

    private void addPageData(
            Model model,
            String query,
            String category,
            Bookmark formBookmark,
            boolean editing,
            boolean formOpen) {
        String search = query.toLowerCase(Locale.ROOT);
        List<Bookmark> bookmarks = repository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .filter(bookmark -> category.equals("all")
                        || (category.equals("favorites")
                                ? bookmark.isFavorite()
                                : category.equals(bookmark.getCategory())))
                .filter(bookmark -> {
                    String searchable = String.join(" ",
                            bookmark.getTitle(),
                            bookmark.getUrl(),
                            bookmark.getCategory(),
                            bookmark.getTag() == null ? "" : bookmark.getTag());
                    return searchable.toLowerCase(Locale.ROOT).contains(search);
                })
                .toList();

        model.addAttribute("bookmarks", bookmarks);
        model.addAttribute("query", query);
        model.addAttribute("selectedCategory", category);
        model.addAttribute("bookmark", formBookmark);
        model.addAttribute("editing", editing);
        model.addAttribute("formOpen", formOpen);
    }
}