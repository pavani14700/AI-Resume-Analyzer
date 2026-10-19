
function login() {
    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value;

    if (user === "admin" && pass === "1234") {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "home.html";
    } else {
        alert("Invalid username or password.");
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}

async function analyze() {
    const fileInput = document.getElementById("resumeFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a resume file first.");
        return;
    }

    const allowedExtensions = /\.(pdf|txt|docx)$/i;

    if (!allowedExtensions.test(file.name)) {
        alert("Please select a PDF, TXT, or DOCX file.");
        return;
    }

    const button = document.querySelector('button[onclick="analyze()"]');
    button.disabled = true;
    button.textContent = "Analyzing...";

    try {
        const formData = new FormData();
        formData.append("resume", file);

        const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Resume analysis failed.");
        }

        localStorage.setItem("resumeAnalysis", JSON.stringify(result.analysis));
        localStorage.setItem("resumeFileName", file.name);
        window.location.href = "result.html";
    } catch (error) {
        alert(error.message || "Could not reach the AI server.");
    } finally {
        button.disabled = false;
        button.textContent = "Analyze Resume";
    }
}

async function generateResume() {
    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value.trim();
    const email = document.getElementById("email").value.trim();
    const education = document.getElementById("education").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const projects = document.getElementById("projects").value.trim();

    if (!name || !role || !email || !education || !skills) {
        alert("Please fill in your name, role, email, education, and skills.");
        return;
    }

    const button = document.getElementById("generateButton");
    button.disabled = true;
    button.textContent = "Generating...";

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, role, email, education, skills, projects })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Resume generation failed.");
        }

        localStorage.setItem("generatedResume", result.resume);
        window.location.href = "preview.html";
    } catch (error) {
        alert(error.message || "Could not reach the AI server.");
    } finally {
        button.disabled = false;
        button.textContent = "Generate Resume";
    }
}

function downloadResume() {
    downloadText(
        localStorage.getItem("generatedResume"),
        "resume.txt"
    );
}

function downloadImprovedResume() {
    downloadText(
        JSON.parse(localStorage.getItem("resumeAnalysis") || "null")?.improvedResume ||
            localStorage.getItem("improvedResume"),
        "resume_draft.txt"
    );
}

function downloadText(text, filename) {
    if (!text) {
        alert("No resume content is available to download.");
        return;
    }

    const blob = new Blob([text], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}
