# Component TestID Checker

` Component TestID Checker` is a command-line tool that checks for the presence of `testID` attributes in React, React Native, and Angular components. This tool helps ensure that all interactive elements in your project have the necessary `testID` or also can detect multiple attributes for testing purposes and can `autofix`.

## Installation

You can install the package globally using npm:

```bash
npm install -g component-testid-checker
```

## Usage

Run the tool using the command:

```
  check-test-ids --config path/to/your-config.json
```

or add it in the scripts of your package.json file

```
  "check-test-ids": "check-test-ids --config config.json"
```

and run

```
   npm run check-test-ids
```

## Screenshots

![Alt Text](https://raw.githubusercontent.com/praveenpr1998/assetsfolder/main/failedtests.png)

![Alt Text](https://raw.githubusercontent.com/praveenpr1998/assetsfolder/main/passedtests.png)

## Configuration

The tool requires a configuration file to specify various options. The configuration file should be a JSON file with the following structure:

## React Native

```
 {
  "directoryToCheck": "src",
  "testIdAttributes": ["testID"],
  "extensions": "js,jsx,tsx,ts",
  "outputFormat": "text",
  "excludePattern": "",
  "autoFix":true,
  "nonInteractiveElements": ["View", "Text", "Image"],
  "internalElementPattern": "^_",
  "interactiveElements": [
    "Button",
    "TouchableOpacity",
    "TextInput",
    "ScrollView",
    "FlatList"
  ],
  "dynamicTestIdFunctions": ["getTestID"],
  "chalkConfig": {
    "componentName": "red",
    "lineNumber": "yellow",
    "filePath": "blue",
    "attributeName": "green",
    "totalMissingCount": "magenta"
  }
}

```

## React

```
{
  "directoryToCheck": "src",
  "testIdAttributes": ["data-testid"],
  "extensions": "js,jsx,tsx,ts",
  "outputFormat": "text",
  "autoFix":true,
  "excludePattern": "",
  "nonInteractiveElements": ["div", "span", "img"],
  "internalElementPattern": "^_",
  "interactiveElements": [
    "button",
    "a",
    "input",
    "select",
    "textarea"
  ],
  "dynamicTestIdFunctions": ["getTestID"],
  "chalkConfig": {
    "componentName": "red",
    "lineNumber": "yellow",
    "filePath": "blue",
    "attributeName": "green",
    "totalMissingCount": "magenta"
  }
}


```

### Configuration Options

### Auto Fix

- **`autoFix`**: If you want the package to autofix the missing attributes in the actual code you can pass this attribute to be true

You will prompted with a question to autofix the missing ones

![Alt Text](https://raw.githubusercontent.com/praveenpr1998/assetsfolder/main/yesno.png)

**yes**:

![Alt Text](https://raw.githubusercontent.com/praveenpr1998/assetsfolder/main/yes.png)

**no**:

![Alt Text](https://raw.githubusercontent.com/praveenpr1998/assetsfolder/main/no.png)

### Other Config

- **`directoryToCheck` (string)**: The directory to search for component files. Default is `'src'`.
- **`testIdAttributes` (array of strings)**: The list of `testID` attributes to check for. Default is `['testID']`.
- **`extensions` (string)**: The file extensions to check, separated by commas. Default is `'js,jsx,tsx,ts'`.
- **`outputFormat` (string)**: The output format for logs, either `'text'` or `'json'`. Default is `'text'`.
- **`excludePattern` (string)**: A glob pattern for files to exclude from the check.
- **`nonInteractiveElements` (array of strings)**: A list of non-interactive element names to exclude from the check.
- **`internalElementPattern` (string)**: A regex pattern to identify internal element names that should be excluded from the check.
- **`interactiveElements` (array of strings)**: A list of interactive element names to include in the check.
- **`dynamicTestIdFunctions` (array of strings)**: A list of function names that dynamically set `testID` attributes.
- **`chalkConfig` (object)**: Configuration for chalk colors. Each key represents a log element, and the value is a string specifying the chalk styles.

## Example

To run the tool with a custom configuration file, use:

```
check-test-ids --config ./my-custom-config.json
```

## Example Output

If the tool finds elements missing testID attributes, it will log warnings:

```
Warning: <Button> in src/components/MyButton.js at line 15 does not have a testID attribute.
Warning: <TouchableOpacity> in src/screens/HomeScreen.js at line 27 does not have a testID attribute.
Total elements missing testID: 2
```

If all elements have testID attributes, it will display a success message:

```
All components have testID attributes.
```

## Additional Information

- **`Non-Interactive Elements`**: The tool will skip checking for testID attributes on elements that are purely decorative or non-interactive.
- **`Internal Elements`**: Elements meant to be private or internal to a component will also be skipped.
- **`Elements with Stable Semantic Selectors`**: If an element can be reliably selected using semantic HTML, ARIA roles, or stable class names, prefer those over adding an extra testID..

## Feedback

If you have any feedback, please reach out to me at praveenpr1998@gmail.com

### Contribution

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

By Order of the Peaky Blinders!
