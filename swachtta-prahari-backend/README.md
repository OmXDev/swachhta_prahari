## Contribution Guide

### Getting Started

1.  **Clone the Repository:**

    ```bash
    https://github.com/KratiTech/swachtta-prahari-backend.git
    ```

2.  **Switch to the Beta Branch:**
    Before making any changes, ensure you are on the `beta` branch. This is our primary development branch.
    ```bash
    git checkout beta
    ```

### Making Changes

1.  **Create a New Branch:**
    For every feature or bug fix, create a new branch from the `beta` branch. This keeps our commit history clean and organized. Please use an appropriate and descriptive branch name.

    **Example Branch Names:**
    - `feature/add-user-authentication`
    - `fix/fix-login-error`
    - `refactor/improve-database-queries`

    To create and switch to a new branch:

    ```bash
    git checkout -b your-branch-name
    ```

2.  **Build Your Feature or Fix Your Bug:**
    Implement your changes in your newly created branch.

3.  **Commit Your Changes:**
    Commit your changes with clear and concise commit messages.

    ```bash
    git add .
    git commit -m "feat: Add new user profile page"
    ```

    (Using conventional commits is recommended)

### Submitting Your Changes

1.  **Push Your Branch:**
    Push your local branch to the remote repository:

    ```bash
    git push origin your-branch-name
    ```

2.  **Create a Pull Request (PR):**
    Once your changes are pushed, go to the repository on GitHub and create a Pull Request.
    - **Target Branch:** Make sure your PR is **against the `beta` branch**.
    - **Title and Description:** Provide a clear title and detailed description of your changes. Explain what problem you're solving or what feature you're adding.
    - **Reviewers:** Request reviews from appropriate team members.

We will review your PR as soon as possible and provide feedback. Thank you for your contribution!
