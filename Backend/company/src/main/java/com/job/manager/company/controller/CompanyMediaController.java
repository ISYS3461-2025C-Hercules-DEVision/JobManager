package com.job.manager.company.controller;

import com.job.manager.company.annotation.CurrentUser;
import com.job.manager.company.dto.*;
import com.job.manager.company.entity.Company;
import com.job.manager.company.entity.CompanyMedia;
import com.job.manager.company.service.CompanyMediaService;
import com.job.manager.company.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/media")
public class CompanyMediaController {

    @Autowired
    private CompanyMediaService mediaService;

    @Autowired
    private CompanyService companyService;

    // Add new media
    @PostMapping
    public ResponseEntity<CompanyMediaResponseDto> addMedia(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody CompanyMediaCreateDto requestDto) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        
        CompanyMedia media = mediaService.addMedia(
                company.getCompanyId(),
                requestDto.getUrl(),
                requestDto.getMediaType(),
                requestDto.getTitle(),
                requestDto.getDescription(),
                requestDto.getOrderIndex()
        );
        
        CompanyMediaResponseDto response = mapToMediaResponse(media);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all media for authenticated company
    @GetMapping
    public ResponseEntity<List<CompanyMediaResponseDto>> getAllMedia(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        List<CompanyMedia> mediaList = mediaService.getMediaByCompany(company.getCompanyId());
        
        List<CompanyMediaResponseDto> response = mediaList.stream()
                .map(this::mapToMediaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // Get active media only
    @GetMapping("/active")
    public ResponseEntity<List<CompanyMediaResponseDto>> getActiveMedia(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        List<CompanyMedia> mediaList = mediaService.getActiveMediaByCompany(company.getCompanyId());
        
        List<CompanyMediaResponseDto> response = mediaList.stream()
                .map(this::mapToMediaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // Get media by type (images or videos)
    @GetMapping("/type/{mediaType}")
    public ResponseEntity<List<CompanyMediaResponseDto>> getMediaByType(
            @CurrentUser AuthenticatedUser user,
            @PathVariable CompanyMedia.MediaType mediaType) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        List<CompanyMedia> mediaList = mediaService.getMediaByType(company.getCompanyId(), mediaType);
        
        List<CompanyMediaResponseDto> response = mediaList.stream()
                .map(this::mapToMediaResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // Update media details
    @PutMapping("/{mediaId}")
    public ResponseEntity<CompanyMediaResponseDto> updateMedia(
            @CurrentUser AuthenticatedUser user,
            @PathVariable String mediaId,
            @Valid @RequestBody CompanyMediaUpdateDto requestDto) {
        
        CompanyMedia media = mediaService.updateMedia(
                mediaId,
                requestDto.getTitle(),
                requestDto.getDescription(),
                requestDto.getOrderIndex(),
                requestDto.getIsActive()
        );
        
        CompanyMediaResponseDto response = mapToMediaResponse(media);
        return ResponseEntity.ok(response);
    }

    // Delete media
    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Void> deleteMedia(
            @CurrentUser AuthenticatedUser user,
            @PathVariable String mediaId) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        mediaService.deleteMedia(mediaId, company.getCompanyId());
        
        return ResponseEntity.noContent().build();
    }

    // Reorder media
    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderMedia(
            @CurrentUser AuthenticatedUser user,
            @RequestBody List<String> mediaIds) {
        
        Company company = companyService.getCompanyByEmail(user.getEmail());
        mediaService.reorderMedia(company.getCompanyId(), mediaIds);
        
        return ResponseEntity.ok().build();
    }

    // Get media count
    @GetMapping("/count")
    public ResponseEntity<Long> getMediaCount(@CurrentUser AuthenticatedUser user) {
        Company company = companyService.getCompanyByEmail(user.getEmail());
        long count = mediaService.getMediaCount(company.getCompanyId());
        
        return ResponseEntity.ok(count);
    }

    private CompanyMediaResponseDto mapToMediaResponse(CompanyMedia media) {
        return CompanyMediaResponseDto.builder()
                .mediaId(media.getMediaId())
                .companyId(media.getCompanyId())
                .url(media.getUrl())
                .mediaType(media.getMediaType())
                .title(media.getTitle())
                .description(media.getDescription())
                .orderIndex(media.getOrderIndex())
                .isActive(media.getIsActive())
                .uploadedAt(media.getUploadedAt())
                .build();
    }
}
