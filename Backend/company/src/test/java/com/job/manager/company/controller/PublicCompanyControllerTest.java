package com.job.manager.company.controller;

import com.job.manager.company.entity.CompanyMedia;
import com.job.manager.company.entity.PublicProfile;
import com.job.manager.company.exception.BusinessException;
import com.job.manager.company.service.CompanyMediaService;
import com.job.manager.company.service.CompanyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.kafka.bootstrap-servers=localhost:29092",
    "spring.data.mongodb.host=localhost",
    "spring.data.mongodb.port=27018"
})
class PublicCompanyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CompanyService companyService;

    @MockBean
    private CompanyMediaService companyMediaService;

    @Test
    void getCompanyPublicProfile_returns200_whenExists() throws Exception {
        String companyId = "company-1";
        PublicProfile profile = PublicProfile.builder()
                .companyId(companyId)
                .displayName("Acme")
                .aboutUs("About")
                .industryDomain("IT")
                .country("VN")
                .city("HCM")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(companyService.getPublicProfile(companyId)).thenReturn(profile);

        mockMvc.perform(get("/public/companies/{companyId}/public-profile", companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyId").value(companyId))
                .andExpect(jsonPath("$.displayName").value("Acme"));
    }

    @Test
    void getCompanyPublicProfile_returns404_whenMissing() throws Exception {
        String companyId = "missing";
        when(companyService.getPublicProfile(companyId)).thenThrow(new BusinessException("Public profile not found"));

        mockMvc.perform(get("/public/companies/{companyId}/public-profile", companyId))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCompanyActiveMedia_returns200_withList() throws Exception {
        String companyId = "company-1";
        CompanyMedia media = CompanyMedia.builder()
                .mediaId("m1")
                .companyId(companyId)
                .url("https://example.com/1.png")
                .mediaType(CompanyMedia.MediaType.IMAGE)
                .title("T")
                .description("D")
                .orderIndex(0)
                .isActive(true)
                .uploadedAt(LocalDateTime.now())
                .build();

        when(companyMediaService.getActiveMediaByCompany(companyId)).thenReturn(List.of(media));

        mockMvc.perform(get("/public/companies/{companyId}/media/active", companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].mediaId").value("m1"))
                .andExpect(jsonPath("$[0].companyId").value(companyId))
                .andExpect(jsonPath("$[0].isActive").value(true));
    }
}
