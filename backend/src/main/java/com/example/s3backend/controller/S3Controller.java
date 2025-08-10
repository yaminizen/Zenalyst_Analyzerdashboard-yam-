package com.example.s3backend.controller;

import com.example.s3backend.service.S3Service;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class S3Controller {

    private final S3Service s3Service;

    public S3Controller(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @GetMapping("/files")
    public List<String> listFiles() {
        // If everything is under "data/", you can strip the prefix here if you want names-only.
        // return s3Service.listJsonFiles().stream().map(k -> k.replaceFirst("^data/", "")).toList();
        return s3Service.listJsonFiles();
    }

    // Now consume ?filename=... instead of /data/{filename}
    @GetMapping(value = "/data", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getData(@RequestParam String filename) {
        // Optional safety: block path traversal
        if (filename.contains("..")) {
            return ResponseEntity.badRequest().body("{\"error\":\"invalid filename\"}");
        }

        // If the client passes names without folder, force the prefix here:
        String key = filename.startsWith("data/") ? filename : "data/" + filename;

        String json = s3Service.getJsonFile(key);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(json);
    }
}
