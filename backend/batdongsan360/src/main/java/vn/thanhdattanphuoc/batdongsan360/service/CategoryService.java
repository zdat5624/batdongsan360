package vn.thanhdattanphuoc.batdongsan360.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.thanhdattanphuoc.batdongsan360.domain.Category;
import vn.thanhdattanphuoc.batdongsan360.repository.CategoryRepository;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Category category) {
        Optional<Category> existingCategory = categoryRepository.findById(category.getId());
        if (existingCategory.isPresent()) {
            Category updatedCategory = existingCategory.get();
            updatedCategory.setName(category.getName());
            updatedCategory.setType(category.getType());
            return categoryRepository.save(updatedCategory);
        }
        throw new RuntimeException("Category not found with id: " + category.getId());
    }

    public void deleteCategory(Long id) {
        Optional<Category> existingCategory = categoryRepository.findById(id);
        if (existingCategory.isPresent()) {
            categoryRepository.deleteById(id);
            return;
        }
        throw new RuntimeException("Category not found with id: " + id);
    }

}
