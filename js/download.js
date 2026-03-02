document.addEventListener('DOMContentLoaded', () => {
    const downloadButtons = document.querySelectorAll('[data-download]');

    for (const button of downloadButtons) {
        button.addEventListener('click', () => {
            const filePath = button.getAttribute('data-download');

            if (!filePath) {
                return;
            }

            const link = document.createElement('a');
            link.href = filePath;
            link.download = '';
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    }
});
