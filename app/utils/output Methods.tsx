
// Message to the Android app
async function fetchTokens(): Promise<string[]> {

  const response = await fetch('/api/saveToken', { method: 'GET' });
  let tokens: string[] = [];
  if (!response.ok) {
    throw new Error('Failed to fetch tokens');
  } else {
    tokens = await response.json();
  }
  return tokens;
}

export async function sendMessageToApp(data: { [key: string]: string; }) {
  try {
    // Fetch the token from your Android app's API endpoint
    const tokens = await fetchTokens();

    if (!tokens || tokens.length === 0) {
      throw new Error('Token not found');
    }

    for (const token of tokens) {
      const response = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          data: data,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Failed to send messages:', result);
      }
    }

  } catch (error) {
    console.error('Error:', error);
    console.error('Failed to send messages.');
  }
}

// Notifications
export function showNotification(message: string) {
  if (Notification.permission === "granted") {
    try {
      new Notification("Pomodoro Timer", {
        body: message,
        // icon: "icon.png", // Ensure this path is correct
        requireInteraction: true, // Key option for persistent notifications
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }
};