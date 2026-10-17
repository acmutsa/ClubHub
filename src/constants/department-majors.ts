import {
  buisnessDepartments,
  caiccDepartments,
  developmentDepartments,
  engineeringDepartments,
  healthDepartments,
  LiberalAndFineArtsDepartments,
  scienceDepartments,
} from "@/constants/department";
import { majorOptions } from "@/constants/majors";

export const collegeDepartments: Record<string, readonly string[]> = {
  "Carlos Alvarez College of Business": buisnessDepartments,
  "Education and Human Development": developmentDepartments,
  "Klesse College of Engineering and Integrated Design": engineeringDepartments,
  "Liberal and Fine Arts": LiberalAndFineArtsDepartments,
  "Health, Community and Policy": healthDepartments,
  Sciences: scienceDepartments,
  "College of Cyber, AI, and Computing": caiccDepartments,
  "Honors College": ["Not applicable (Honors College)"],
};

const departmentMajorOptions = {
  Accounting: ["Accounting", "Accounting Technician"],
  Economics: ["Economics", "Business/Managerial Economics"],
  Finance: [
    "Finance, General",
    "Financial Planning & Services",
    "Banking & Financial Support Services",
    "Investments & Securities",
    "Insurance & Risk Management",
  ],
  Management: [
    "Business Administration & Management, General",
    "Entrepreneurship",
    "Human Resources Management",
    "International Business Management",
  ],
  Marketing: [
    "Marketing Management & Research",
    "Advertising",
    "Public Relations",
    "Sales, Merchandising, & Marketing, General",
  ],
  "Operations and Analytics": [
    "Operations Management",
    "Supply Chain Management",
    "Logistics & Materials Management",
    "Project Management",
    "Business/Management Quantitative Methods, General",
  ],
  "Embrey Real Estate Finance and Development Program": ["Real Estate"],
  "Bicultural-Bilingual Studies/Race, Ethnicity, Gender and Sexuality Studies": [
    "Gender & Women's Studies",
    "African American/Black Studies",
    "Native American Studies",
    "Asian Studies",
    "Latin American Studies",
  ],
  Counseling: ["Psychology, Clinical & Counseling", "Psychology, General"],
  "Educational Leadership and Policy Studies": [
    "Educational Leadership & Administration",
    "Education, General",
  ],
  "Educational Psychology": [
    "Human Development & Family Studies",
    "Psychology, General",
  ],
  "Interdisciplinary Learning and Teaching": [
    "Education, General",
    "Early Childhood Education",
    "Elementary Education",
    "Secondary Education",
    "Special Education",
  ],
  "School of Architecture & Planning": [
    "Architecture",
    "Landscape Architecture",
    "Urban Planning",
    "Interior Design",
  ],
  "Department of Biomedical & Chemical Engineering": [
    "Biomedical Engineering",
    "Chemical Engineering",
  ],
  "School of Civil & Environmental Engineering, and Construction Management": [
    "Civil Engineering",
    "Environmental Engineering",
    "Construction Engineering/Management",
    "Architectural Engineering",
  ],
  "Department of Electrical Engineering": [
    "Electrical Engineering",
    "Computer Engineering",
  ],
  "Department of Mechanical, Aerospace, and Industrial Engineering": [
    "Aerospace/Aeronautical Engineering",
    "Mechanical Engineering",
    "Industrial Engineering",
    "Mechatronics & Robotics Engineering",
  ],
  "Department of Anthropology": ["Anthropology", "Archaeology"],
  "School of Art": [
    "Art, General",
    "Art History, Criticism & Conservation",
    "Graphic Design",
    "Industrial Design",
    "Photography",
    "Fine/Studio Arts",
  ],
  "School of Communication, Language, and Culture": [
    "Communications, General",
    "Broadcasting (Radio & Television)",
    "Journalism",
    "Mass Communication/Media Studies",
    "Digital Media",
    "Foreign Languages/Literatures, General",
    "Spanish Language & Literature",
  ],
  "Department of English": [
    "American/English Literature",
    "English Language & Literature, General",
    "Creative Writing",
  ],
  "Department of History": [
    "History",
    "Asian Studies",
    "Latin American Studies",
    "Middle Eastern Studies",
  ],
  "Interdisciplinary School for Engagement": [
    "Liberal Arts & Sciences, General Studies",
    "Gender & Women's Studies",
    "International Relations & Affairs",
  ],
  "School of Music": [
    "Music, General",
    "Music Education",
    "Music Performance",
    "Music, Theory & Composition",
  ],
  "Department of Philosophy and Classics": [
    "Philosophy",
    "Classical/Ancient Languages & Literatures",
    "Religious Studies",
  ],
  "Department of Political Science and Geography": [
    "Political Science & Government",
    "Geography",
    "Public Policy",
    "International Relations & Affairs",
  ],
  "College for Health, Community and Policy": [
    "Social Sciences, General",
    "Health Sciences, General",
  ],
  "Criminology and Criminal Justice": ["Criminology", "Criminal Justice"],
  Kinesiology: [
    "Exercise Science & Kinesiology",
    "Athletic Training",
    "Physical Education & Coaching",
  ],
  "Nutrition and Dietetics": ["Nutrition & Dietetics"],
  Psychology: ["Psychology, Clinical & Counseling", "Psychology, General"],
  "Public Administration": ["Public Administration", "Nonprofit Management"],
  "Public Health": ["Public Health", "Health Services Administration,General"],
  "Social Work": ["Social Work"],
  "Sociology and Demography": ["Sociology", "Social Sciences, General"],
  "Biology, Health, and the Environment": [
    "Biology, General",
    "Ecology",
    "Environmental Science",
    "Environmental Studies",
    "Zoology",
  ],
  Chemistry: ["Chemistry", "Biochemistry & Biophysics"],
  "Earth and Planetary Sciences": [
    "Geological & Earth Sciences",
    "Atmospheric Sciences & Meteorology",
  ],
  Mathematics: ["Mathematics, General", "Applied Mathematics"],
  "Molecular Microbiology and Immunology": [
    "Microbiology & Immunology",
    "Cell/Cellular Biology",
    "Genetics",
  ],
  "Neuroscience, Developmental and Regenerative Biology": [
    "Neuroscience",
    "Biology, General",
  ],
  "Physics and Astronomy": ["Physics", "Astronomy", "Physical Sciences, General"],
  "Computer Engineering": ["Computer Engineering", "Computer & Information Sciences, General"],
  "Computer Science": [
    "Computer Science",
    "Computer & Information Sciences, General",
    "Artificial Intelligence",
    "Computer Networking/Telecommunications",
    "Cyber Security",
    "Data Science",
    "Software Engineering",
  ],
  "Information Systems & Cybersecurity": [
    "Information Technology And Systems",
    "Management Information Systems",
    "Information Science",
    "Cyber Security",
  ],
  "Statistics & Data Science": [
    "Statistics",
    "Data Science",
    "Applied Mathematics",
  ],
  "Not applicable (Honors College)": [...majorOptions],
} satisfies Record<string, readonly (typeof majorOptions)[number][]>;

export function getDepartmentMajorOptions(department: string): readonly string[] {
  const options = departmentMajorOptions[department as keyof typeof departmentMajorOptions];
  if (!options) {
    throw new Error(`No major options configured for department "${department}".`);
  }
  return Array.from(new Set([...options, "Undecided / Undeclared", "Other"]));
}
