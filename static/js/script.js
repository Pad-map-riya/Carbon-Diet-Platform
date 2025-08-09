document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("actionForm");
    const leaderboardBody = document.getElementById("leaderboardBody");
    const submitButton = form.querySelector("button[type='submit']");

    // Load leaderboard on page load
    loadLeaderboard();

    // Handle form submit
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const action = document.getElementById("action").value;
        if (!action) {
            alert("Please select an action!");
            return;
        }

        const name = prompt("Enter your name:", "Guest");
        if (!name) return;

        // Show loading state
        const originalText = submitButton.textContent;
        submitButton.innerHTML = '<span class="loading"></span> Submitting...';
        submitButton.disabled = true;

        try {
            const response = await fetch("/log_action", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name, action})
            });

            const data = await response.json();
            
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                updateLeaderboard(data.leaderboard);
                form.reset();
                
                // Show success message
                showNotification(`Action logged successfully! You earned points for ${getActionName(action)}.`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });

    async function loadLeaderboard() {
        try {
            const response = await fetch("/leaderboard");
            const data = await response.json();
            updateLeaderboard(data);
        } catch (error) {
            console.error("Error loading leaderboard:", error);
            leaderboardBody.innerHTML = '<tr><td colspan="3">Error loading leaderboard</td></tr>';
        }
    }

    function updateLeaderboard(data) {
        leaderboardBody.innerHTML = "";
        
        if (data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="3">No players yet. Be the first!</td></tr>';
            return;
        }

        data.forEach((player, index) => {
            const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
            leaderboardBody.innerHTML += `
                <tr>
                    <td>${rankEmoji} ${index + 1}</td>
                    <td>${escapeHtml(player.name)}</td>
                    <td>${player.points}</td>
                </tr>
            `;
        });
    }

    function getActionName(action) {
        const actions = {
            "cycle": "cycling to work",
            "recycle": "recycling waste", 
            "plant": "planting a tree",
            "reuse": "using a reusable bag"
        };
        return actions[action] || action;
    }

    function showNotification(message) {
        // Simple notification - you could enhance this with a proper notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});