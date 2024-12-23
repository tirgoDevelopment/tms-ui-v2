export function removeDuplicateKeys(formData: FormData): FormData {
    const seenKeys = new Set();
    const formDataWithoutDuplicates = new FormData();

    formData.forEach((value, key) => {
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            formDataWithoutDuplicates.append(key, value);
        } else {
            formDataWithoutDuplicates.delete(key);
            formDataWithoutDuplicates.append(key, value);
        }
    });
    return formDataWithoutDuplicates;
}