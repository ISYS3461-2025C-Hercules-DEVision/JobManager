package com.job.manager.company.service;

import com.job.manager.company.entity.CompanyMedia;
import com.job.manager.company.exception.BusinessException;
import com.job.manager.company.repository.CompanyMediaRepository;
import com.job.manager.company.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CompanyMediaService {

    @Autowired
    private CompanyMediaRepository mediaRepository;

    @Autowired
    private CompanyRepository companyRepository;

    private static final int MAX_MEDIA_PER_COMPANY = 10;

    @Transactional
    public CompanyMedia addMedia(String companyId, String url, CompanyMedia.MediaType mediaType, 
                                 String title, String description, Integer orderIndex) {
        // Verify company exists
        if (!companyRepository.existsById(companyId)) {
            throw new BusinessException("Company not found");
        }

        // Check media count limit
        long currentCount = mediaRepository.countByCompanyId(companyId);
        if (currentCount >= MAX_MEDIA_PER_COMPANY) {
            throw new BusinessException("Maximum media limit reached (" + MAX_MEDIA_PER_COMPANY + ")");
        }

        // If no order specified, add to end
        if (orderIndex == null) {
            orderIndex = (int) currentCount;
        }

        CompanyMedia media = CompanyMedia.builder()
                .mediaId(UUID.randomUUID().toString())
                .companyId(companyId)
                .url(url)
                .mediaType(mediaType)
                .title(title)
                .description(description)
                .orderIndex(orderIndex)
                .isActive(true)
                .uploadedAt(LocalDateTime.now())
                .build();

        return mediaRepository.save(media);
    }

    public List<CompanyMedia> getMediaByCompany(String companyId) {
        return mediaRepository.findByCompanyIdOrderByOrderIndexAsc(companyId);
    }

    public List<CompanyMedia> getActiveMediaByCompany(String companyId) {
        return mediaRepository.findByCompanyIdAndIsActive(companyId, true);
    }

    public List<CompanyMedia> getMediaByType(String companyId, CompanyMedia.MediaType mediaType) {
        return mediaRepository.findByCompanyIdAndMediaType(companyId, mediaType);
    }

    @Transactional
    public CompanyMedia updateMedia(String mediaId, String title, String description, 
                                   Integer orderIndex, Boolean isActive) {
        CompanyMedia media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new BusinessException("Media not found"));

        if (title != null) media.setTitle(title);
        if (description != null) media.setDescription(description);
        if (orderIndex != null) media.setOrderIndex(orderIndex);
        if (isActive != null) media.setIsActive(isActive);

        return mediaRepository.save(media);
    }

    @Transactional
    public void deleteMedia(String mediaId, String companyId) {
        CompanyMedia media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new BusinessException("Media not found"));

        // Verify ownership
        if (!media.getCompanyId().equals(companyId)) {
            throw new BusinessException("Unauthorized: Media does not belong to this company");
        }

        mediaRepository.deleteById(mediaId);
    }

    @Transactional
    public void deleteAllMediaByCompany(String companyId) {
        mediaRepository.deleteByCompanyId(companyId);
    }

    @Transactional
    public void reorderMedia(String companyId, List<String> mediaIds) {
        for (int i = 0; i < mediaIds.size(); i++) {
            String mediaId = mediaIds.get(i);
            CompanyMedia media = mediaRepository.findById(mediaId)
                    .orElseThrow(() -> new BusinessException("Media not found: " + mediaId));

            if (!media.getCompanyId().equals(companyId)) {
                throw new BusinessException("Unauthorized: Media does not belong to this company");
            }

            media.setOrderIndex(i);
            mediaRepository.save(media);
        }
    }

    public long getMediaCount(String companyId) {
        return mediaRepository.countByCompanyId(companyId);
    }
}
