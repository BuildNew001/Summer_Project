# Codeblaze: Your Next-Generation Online Judge Platform :fire:
## :book: About Codeblaze
Codeblaze is a fully developed online judge platform designed to offer a comprehensive and engaging environment for competitive programmers and learners alike. This project has been an incredibly enriching journey, allowing me to dive deep into crucial aspects of modern web development, including scalable system design, secure authentication, AI integration, and robust real-time code execution pipelines.

My goal with Codeblaze was to create a seamless and intuitive experience from start to finish: from effortlessly solving problems and receiving instant, detailed feedback, to tracking personal progress and gaining unique AI-powered insights into your code.


## :link: Live Platform & Demo

Experience Codeblaze firsthand:

* **Live Platform:** [https://www.algocodeblaze.space/](https://www.algocodeblaze.space/)
* **Demo Video:** [https://www.loom.com/share/6f9fe2668650414691457ef716724909?sid=1589610c-73e4-4309-98e8-62e4b8ba6761](https://www.loom.com/share/6f9fe2668650414691457ef716724909?sid=1589610c-73e4-4309-98e8-62e4b8ba6761)

---

## :white_check_mark: Key Features

Codeblaze is packed with functionalities crafted to enhance every step of your competitive programming and learning journey:

* **:closed_lock_with_key: User Authentication:**
    * Secure and streamlined login and registration processes.
    * Robust **session management** ensures persistent and reliable user authentication.
* **:computer: Problem Solving Environment:**
    * An intuitive interface that allows you to effortlessly **browse, filter, and search** coding problems by difficulty.
    * A seamless coding experience designed for **focused problem-solving**.
* **:writing_hand: Multi-Language Code Editor:**
    * Full support for popular programming languages: **C, C++, Java, and Python**.
    * Includes **preloaded boilerplates** to help you kickstart your solutions faster.
* **:gear: Submission System with Verdicts:**
    * Engineered with an **AWS SQS queue for asynchronous job processing**, ensuring high scalability and efficient handling of multiple submissions.
    * Provides **real-time feedback** on your code submissions, delivering detailed verdicts like Accepted, Wrong Answer, Time Limit Exceeded, and more.
* **:bar_chart: User Profile Dashboard:**
    * Comprehensive tracking of your coding milestones, including **total problems solved**, daily, and longest streaks.
    * A visual **heatmap** to represent your submission activity over time.
    * A detailed list of your recent submissions with timestamps for easy review and analysis.
* **:technologist: Admin & Problem Setter Tools:**
    * A dedicated and powerful interface to **add, edit, and manage problems**.
    * Granular control over problem visibility and the ability to designate **featured challenges**.
* **:robot: AI-Powered Code Review:**
    * **Highlights missed edge cases**, provides logical suggestions for improvement, and **identifies potential bugs** in your code, accelerating your learning process.
* **:star: Submission History:**
    * A complete archive allowing you to review all your past attempts for any given problem.
    * Facilitates in-depth analysis of your solutions over time to pinpoint areas for continuous improvement.

## 🛠️ Tech Stack

Codeblaze is built upon a modern, robust, and scalable architecture, leveraging industry-standard technologies:

**Frontend:**
* **React.js:** A declarative, efficient, and flexible JavaScript library for building user interfaces.
* **Tailwind CSS:** A utility-first CSS framework that allows for rapid UI development and highly customized designs.
* **Deployment:** Vercel for fast and reliable frontend hosting.

**Backend:**
* **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine, enabling high-performance server-side applications.
* **Express:** A fast, unopinionated, minimalist web framework for Node.js, used for building robust APIs.
* **MongoDB:** A powerful NoSQL document database, providing flexible and scalable data storage.
* **Hosting:** AWS EC2 for dependable backend server infrastructure.

**Code Execution & Microservices:**
* **AWS SQS (Simple Queue Service):** A fully managed message queuing service used for decoupling microservices and efficiently handling the asynchronous processing of code submissions.
* **Custom Compiler Infrastructure:** A tailored system designed to securely compile and execute user code in an isolated environment.
* **Deployment:** Dockerized microservices ensure consistent, isolated, and efficient deployment across various environments.

---

## :rocket: Getting Started (Local Setup)

To set up Codeblaze locally for development or testing, follow these detailed steps. Ensure you have Node.js, npm, Docker (if using for judge), and Git installed on your system.

### 1. Clone the Repository

Begin by cloning the Codeblaze repository to your local machine:

```bash
git clone [https://github.com/BuildNew001/codeblaze.git](https://github.com/your-username/codeblaze.git)
cd codeblaze
```
### 2.Install Dependencies & Configure Environment Variables
Navigate into backend , complier and  frontend directories to install dependencies. Create .env files in both directories and add necessary environment variables (e.g., MongoDB connection string, AWS credentials, backend URL).
```bash
# In backend directory
npm install
# Create backend/.env with your config
# In complier directory
npm install
# Create complier/.env with your config
# In frontend directory
npm install
# Create frontend/.env with your config (e.g., REACT_APP_BACKEND_URL=http://localhost:1000)
```
### 3.Start the Servers
```bash
# In the backend directory
node server.js
# In a new terminal, in the complier directory
node server.js
# In a new terminal, in the frontend directory
npm run dev
```
