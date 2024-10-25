
# Pomodoro Timer Chrome Extension

![Extension Logo](path/to/logo.png)

## Overview

This Chrome extension is a **Pomodoro Timer** designed to help you stay productive by dividing work into focus and break intervals. It allows you to set focus sessions, track your progress visually with a progress ring, and notifies you when it's time for a break. The timer can be customized with different time options, and your stats are saved locally for each session.

![Preview of Extension](path/to/preview-image.png)

## Features

- **Customizable Timer**: Choose between predefined or custom focus times.
- **Visual Progress Ring**: See your progress visually with a dynamic ring.
- **Automatic Breaks**: After each focus session, a break is automatically initiated.
- **Session Stats**: Track your total sessions and minutes for each day.
- **Notifications**: Receive alerts when focus sessions or breaks are complete.

## How to Use

1. **Start a Focus Session**: Click the "Start" button to begin your focus session. The timer will count down, and the progress ring will update.
2. **Customize Time**: Select a predefined time option or enter a custom time to suit your needs.
3. **Breaks**: After each focus session, you'll be notified to take a break.
4. **Track Progress**: Your daily sessions and total minutes are tracked and displayed.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode**.
4. Click on **Load Unpacked** and select the folder containing the extension files.
5. The extension should now appear in your toolbar.

## File Structure

```
/popup.js           - Main script for handling timer logic and UI interactions
/manifest.json      - Configuration for the Chrome extension
/icon48.png         - Icon for notifications and extension display
/logo.png           - Extension logo (optional)
```

## Technologies Used

- **JavaScript**: For handling timer logic, user input, and storage.
- **Chrome APIs**: For local storage and notifications.
- **HTML/CSS**: To build and style the user interface.

## Contributing

Contributions are welcome! Please submit a pull request or raise an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
