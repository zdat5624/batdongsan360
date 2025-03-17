package vn.thanhdattanphuoc.batdongsan360.controller;

import java.util.Collections;
import java.util.List;

import java.util.ArrayList;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import vn.thanhdattanphuoc.batdongsan360.service.FileStorageService;

@RestController
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/gif");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/api/upload/file")
    public ResponseEntity<List<String>> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
        if (files.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonList("No files uploaded!"));
        }

        List<String> fileNames = new ArrayList<>();
        for (MultipartFile file : files) {
            String fileName = fileStorageService.storeFile(file);
            fileNames.add(fileName);
        }

        return ResponseEntity.ok(fileNames);
    }

    @PostMapping("/api/upload/img")
    public ResponseEntity<?> uploadImages(@RequestParam("files") List<MultipartFile> files) {
        if (files.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "No files uploaded!"));
        }

        List<String> fileNames = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.getSize() > MAX_FILE_SIZE) {
                errors.add(file.getOriginalFilename() + " exceeds 5MB limit");
                continue;
            }

            if (!ALLOWED_TYPES.contains(file.getContentType())) {
                errors.add(file.getOriginalFilename() + " is not a valid image file");
                continue;
            }

            String fileName = fileStorageService.storeFile(file);
            fileNames.add(fileName);
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("errors", errors));
        }

        return ResponseEntity.ok(Collections.singletonMap("uploaded", fileNames));
    }

}
