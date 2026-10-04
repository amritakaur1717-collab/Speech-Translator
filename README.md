# Speech Translator

A web-based speech translation application built with modern web technologies. This tool allows users to record their voice, transcribe speech into text in real-time, and translate the transcribed text into multiple target languages with seamless audio-to-text integration.

## Features

* **Real-time Speech Recognition:** Instantly convert spoken words into text directly within the browser using the Web Speech API.
* **Multi-Language Support:** Translate transcribed text into a wide range of global languages.
* **Text-to-Speech Output:** Listen to translated text using built-in browser speech synthesis.
* **Responsive & Clean UI:** Designed with a modern, distraction-free interface for optimal usability.
* **Client-Side Architecture:** Zero complex backend setup required for core transcription and translation mechanics.

## Prerequisites

To run this application, you need a modern web browser that supports the Web Speech API (such as Google Chrome, Microsoft Edge, or Safari).

## Getting Started

1. Clone or download the project files to your local machine:
   ```bash
   git clone https://github.com/your-username/speech-translator.git
   ```

2. Open the project folder and locate the main application file (e.g., `index.html`).

3. Double-click the file or serve it using a local development server (like Live Server in VS Code) to test microphone permissions and functionality properly.

## Usage

1. Open the application in your browser.
2. Select your desired target language from the dropdown menu.
3. Click the microphone/record button and begin speaking clearly.
4. View the real-time transcription and see the translated text appear instantly.
5. Use the playback button to hear the translation spoken aloud.

## Configuration & Customization

The application logic can be customized directly within the script block of the main HTML file:
* **Supported Languages:** Modify the language arrays or option tags to add or remove translation targets.
* **Styling:** Tailwind CSS classes or custom stylesheets can be adjusted to match your preferred theme.

## Browser Compatibility

| Browser | Speech Recognition | Speech Synthesis |
| :--- | :--- | :--- |
| **Google Chrome** | Fully Supported | Fully Supported |
| **Microsoft Edge** | Fully Supported | Fully Supported |
| **Mozilla Firefox** | Limited / Polyfill Required | Fully Supported |
| **Safari** | Partially Supported | Fully Supported |

## Contributing

Contributions are welcome! If you would like to improve the translation accuracy, styling, or feature set:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/NewTranslationFeature`).
3. Commit your changes (`git commit -m 'Add NewTranslationFeature'`).
4. Push to the branch (`git push origin feature/NewTranslationFeature`).
5. Open a pull request.

## License

Distributed under the MIT License. See `LICENSE` for more information.
