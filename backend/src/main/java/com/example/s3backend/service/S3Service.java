package com.example.s3backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.*;
import software.amazon.awssdk.services.s3.model.*;

import java.util.List;
import java.util.stream.Collectors;
import java.io.InputStream;
import java.util.Scanner;

@Service
public class S3Service {

    private final S3Client s3Client;
    private final String bucketName;

    public S3Service(
            @Value("${aws.accessKey}") String accessKey,
            @Value("${aws.secretKey}") String secretKey,
            @Value("${aws.region}") String region,
            @Value("${aws.bucketName}") String bucketName
    ) {
        this.bucketName = bucketName;
        AwsBasicCredentials creds = AwsBasicCredentials.create(accessKey, secretKey);
        s3Client = S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(creds))
                .region(Region.of(region))
                .build();
    }

public List<String> listJsonFiles() {
    ListObjectsV2Request request = ListObjectsV2Request.builder()
            .bucket(bucketName)
            .prefix("data/") // <— list only files under data/
            .build();

    ListObjectsV2Response result = s3Client.listObjectsV2(request);
    return result.contents().stream()
            .map(S3Object::key)
            .filter(key -> key.endsWith(".json"))
            .collect(Collectors.toList());
}

public String getJsonFile(String key) {
    GetObjectRequest request = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();

    try (InputStream inputStream = s3Client.getObject(request);
         Scanner scanner = new Scanner(inputStream).useDelimiter("\\A")) {
        return scanner.hasNext() ? scanner.next() : "";
    } catch (Exception e) {
        throw new RuntimeException("Error reading file: " + key, e);
    }
}

}
