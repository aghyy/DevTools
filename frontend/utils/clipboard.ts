export const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const handlePaste = (setter: React.Dispatch<React.SetStateAction<string>>) => {
  navigator.clipboard.readText().then((text) => setter(text));
};