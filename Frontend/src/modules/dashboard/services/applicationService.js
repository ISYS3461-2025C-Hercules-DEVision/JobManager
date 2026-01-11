import { httpClient } from "../../../utils/HttpUtil";
import { ENV } from "../../../config/env";

const APPLICATION_BASE_URL = `${ENV.API_BASE_URL}/api/v1/applications`;
const APPLICANT_BASE_URL = "http://13.210.119.17:10789/api/v1/applicants";

// 🚧 MOCK DATA - Remove when backend API is ready
const MOCK_APPLICATIONS = [
  {
    applicationId: "app-001",
    jobPostId: "1940a329-46d4-42a7-bc89-d5a9014ad4c5",
    applicantId: "applicant-001",
    companyId: "69620acb4b3805465e8406c7",
    timeApplied: "2026-01-10T09:30:00Z",
    status: "PENDING",
    fileUrls: [
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    ],
  },
  {
    applicationId: "app-002",
    jobPostId: "1940a329-46d4-42a7-bc89-d5a9014ad4c5",
    applicantId: "applicant-002",
    companyId: "69620acb4b3805465e8406c7",
    timeApplied: "2026-01-09T14:20:00Z",
    status: "PENDING",
    fileUrls: [
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    ],
  },
  {
    applicationId: "app-003",
    jobPostId: "31657ccf-b120-488b-a1a5-7144363926b1",
    applicantId: "applicant-003",
    companyId: "6960ba1d4b3805465e8406c5",
    timeApplied: "2026-01-11T08:15:00Z",
    status: "PENDING",
    fileUrls: [
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    ],
  },
];

const MOCK_APPLICANTS = {
  "applicant-001": {
    id: "applicant-001",
    name: "Nguyen Van A",
    email: "nguyenvana@gmail.com",
    phone: "+84 912 345 678",
    location: "Ho Chi Minh City, Vietnam",
    summary:
      "Experienced Full-Stack Developer with 5+ years in building scalable web applications. Proficient in Python, TypeScript, React, and Node.js.",
    skills: [
      "Python",
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "Docker",
    ],
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp Vietnam",
        duration: "2022 - Present",
        description:
          "Led development of microservices architecture serving 1M+ users",
      },
      {
        title: "Software Engineer",
        company: "StartupXYZ",
        duration: "2019 - 2022",
        description: "Built e-commerce platform using React and Node.js",
      },
    ],
    education: [
      {
        degree: "Bachelor of Computer Science",
        school: "HCMC University of Technology",
        year: "2019",
      },
    ],
  },
  "applicant-002": {
    id: "applicant-002",
    name: "Tran Thi B",
    email: "tranthib@gmail.com",
    phone: "+84 987 654 321",
    location: "Hanoi, Vietnam",
    summary:
      "Frontend specialist with expertise in React, Vue.js, and modern CSS frameworks. Passionate about creating intuitive user experiences.",
    skills: ["React", "Vue.js", "TypeScript", "Tailwind CSS", "Figma", "Git"],
    experience: [
      {
        title: "Frontend Developer",
        company: "Digital Agency Co.",
        duration: "2020 - Present",
        description:
          "Developed responsive web applications for enterprise clients",
      },
    ],
    education: [
      {
        degree: "Bachelor of Information Technology",
        school: "Hanoi University of Science and Technology",
        year: "2020",
      },
    ],
  },
  "applicant-003": {
    id: "applicant-003",
    name: "Le Van C",
    email: "levanc@gmail.com",
    phone: "+84 901 234 567",
    location: "Da Nang, Vietnam",
    summary:
      "UI/UX Designer and Frontend Developer. 3 years of experience in creating beautiful and functional web interfaces.",
    skills: ["React", "JavaScript", "HTML", "CSS", "Adobe XD", "Sketch"],
    experience: [
      {
        title: "Frontend Developer",
        company: "Creative Studio",
        duration: "2021 - Present",
        description:
          "Design and implement user interfaces for mobile applications",
      },
    ],
    education: [
      {
        degree: "Bachelor of Design",
        school: "Da Nang University of Technology",
        year: "2021",
      },
    ],
  },
};

/**
 * Application Service
 * Handles job application management
 */
export const applicationService = {
  /**
   * Get all applications for a specific job post
   * @param {string} jobPostId - Job Post ID
   * @returns {Promise<Array>} List of applications
   */
  async getApplicationsForJobPost(jobPostId) {
    // 🚧 MOCK: Return mock data - Remove when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = MOCK_APPLICATIONS.filter(
          (app) => app.jobPostId === jobPostId
        );
        resolve(filtered);
      }, 500); // Simulate network delay
    });

    /* REAL API - Uncomment when backend is ready
    try {
      const response = await httpClient.get(
        `${APPLICATION_BASE_URL}/${companyId}/job-posts/${jobPostId}/applications`
      );
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      throw error;
    }
    */
  },

  /**
   * Get applicant details by ID
   * @param {string} applicantId - Applicant ID
   * @returns {Promise<Object>} Applicant details
   */
  async getApplicantById(applicantId) {
    // 🚧 MOCK: Return mock data - Remove when backend is ready
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const applicant = MOCK_APPLICANTS[applicantId];
        if (applicant) {
          resolve(applicant);
        } else {
          reject(new Error("Applicant not found"));
        }
      }, 300); // Simulate network delay
    });

    /* REAL API - Uncomment when backend is ready
    try {
      const response = await fetch(`${APPLICANT_BASE_URL}/${applicantId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch applicant details");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch applicant:", error);
      throw error;
    }
    */
  },

  /**
   * Approve an application
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Updated application
   */
  async approveApplication(applicationId) {
    // 🚧 MOCK: Simulate approval - Remove when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✅ MOCK: Approved application ${applicationId}`);
        resolve({ applicationId, status: "APPROVED" });
      }, 500);
    });

    /* REAL API - Uncomment when backend is ready
    try {
      const response = await httpClient.post(
        `${APPLICATION_BASE_URL}/${applicationId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to approve application:", error);
      throw error;
    }
    */
  },

  /**
   * Reject an application
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Updated application
   */
  async rejectApplication(applicationId) {
    // 🚧 MOCK: Simulate rejection - Remove when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`❌ MOCK: Rejected application ${applicationId}`);
        resolve({ applicationId, status: "REJECTED" });
      }, 500);
    });

    /* REAL API - Uncomment when backend is ready
    try {
      const response = await httpClient.post(
        `${APPLICATION_BASE_URL}/${applicationId}/reject`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to reject application:", error);
      throw error;
    }
    */
  },
};
