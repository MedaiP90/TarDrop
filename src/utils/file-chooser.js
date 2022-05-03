class FileChooser {
  static open(multiple = false, folder = false, onchange = () => {}) {
    const fakeInput = document.createElement("input");

    fakeInput.type = "file";
    fakeInput.multiple = multiple || folder;
    fakeInput.webkitdirectory = folder;
    fakeInput.onchange = () => onchange(fakeInput);

    fakeInput.click();
  }
}

export { FileChooser };
