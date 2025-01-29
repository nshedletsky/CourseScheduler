document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll('.pill');
    const dropBoxes = document.querySelectorAll('.drop-box');
    const colors = ['#007bff', '#28a745', '#ffc107', '#fd7e14', '#dc3545', '#6f42c1'];

    // Initially hide all pills
    pills.forEach(pill => {
        pill.style.display = 'none'; // Hide pills initially
        const textNode = pill.childNodes[0]; // Get the first child node (text node)
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.nodeValue = textNode.nodeValue.replace(/^\+/, '≡');
        }
        pill.addEventListener('dragstart', dragStart);
        pill.addEventListener('dblclick', showColorPicker);
        pill.dataset.colorIndex = 0; // Initialize color index
    });

    // Event listener for groupSelector dropdown change
    document.getElementById('groupSelector').addEventListener('change', function() {
        const selectedGroup = this.value; // Get selected department/group
        filterPills(selectedGroup);
    });

    // Trigger filter when page loads (for default dropdown value "all")
    filterPills(document.getElementById('groupSelector').value);

    function filterPills(selectedGroup) {
        pills.forEach(pill => {
            // Show the pill if it's in the selected department or show all when 'all' is selected
            if (selectedGroup === 'all' || pill.getAttribute('data-group') === selectedGroup) {
                if (!pill.classList.contains('used')) { // Hide the used ones
                    pill.style.display = 'block'; // Show the pill
                }
            } else {
                pill.style.display = 'none'; // Hide the pill
            }
        });
    }

    // Rest of your existing code
    dropBoxes.forEach(box => {
        box.addEventListener('dragover', dragOver);
        box.addEventListener('drop', drop);
    });

    document.getElementById('export').addEventListener('click', () => {
        // Hide the button
        document.getElementById('export').style.display = 'none';
        document.getElementById('export-excel').style.display = 'none';

        // Remove the pill-container
        const pillContainer = document.querySelector('.pill-container');
        pillContainer.style.display = 'none';

        // Get the current date
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Get the filename element by its ID
        const filenameElement = document.getElementById('filename');
        const filenameContent = filenameElement.innerText;

        // Set options for html2pdf
        const opt = {
            margin: 0.1,
            filename: `${filenameContent}_${formattedDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
            pagebreak: { mode: ['css'] }
        };

        // Generate and save the PDF
        html2pdf().set(opt).from(document.getElementById('pdf-content')).save().then(() => {
            // Restore the pill-container
            pillContainer.style.display = 'flex';

            // Show the button again after saving
            document.getElementById('export').style.display = 'block';
            document.getElementById('export-excel').style.display = 'block';
        });
    });

    document.getElementById('export-excel').addEventListener('click', () => {
        const data = [];
        const firstListItemText = document.querySelector('ul li').innerText;
        dropBoxes.forEach(box => {
            const pills = box.querySelectorAll('.pill');
            pills.forEach(pill => {
                const seasonLabel = document.querySelector(`.drop-label[data-season="${box.dataset.season}"]`).innerText;
                const timeLabel = document.querySelector(`.drop-label[data-time="${box.dataset.time}"]`).innerText;
                const pillColor = pill.style.backgroundColor;
                const pillText = pill.querySelector(".pillLabel");
                const colorLabelElement = Array.from(document.querySelectorAll('ul li')).find(li => li.style.color === pillColor);
                const colorLabel = colorLabelElement ? colorLabelElement.innerText : firstListItemText;
                data.push({
                    Session: seasonLabel,
                    Time: timeLabel,
                    Course: pillText.innerText,
                    Category: colorLabel
                });
            });
        });
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pills');

        // Get the current date and format it
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Get the filename element by its ID
        const filenameElement = document.getElementById('filename');
        const filenameContent = filenameElement.innerText;

        // Create the file name
        const fileName = `${filenameContent}_${formattedDate}.xlsx`;

        // Write the file with the dynamic file name
        XLSX.writeFile(workbook, fileName);
    });

    // Drag functions
    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.outerHTML);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        if (e.target.classList.contains('drop-box')) {
            const data = e.dataTransfer.getData('text/plain');
            const newPill = document.createElement('div');
            newPill.innerHTML = data;
            const pillElement = newPill.firstChild;
            pillElement.addEventListener('dragstart', dragStart);
            pillElement.addEventListener('dblclick', showColorPicker);
            pillElement.dataset.colorIndex = 0; // Initialize color index for new pills
            addDeleteButton(pillElement);

            // Mark the pill as used when it's dropped
            pillElement.classList.add('used'); // Add "used" class

            // Hide pill in the list of available pills
            pillElement.style.display = 'none'; // Hide the pill from the pill list
            e.target.appendChild(pillElement);
        } else {
            e.dataTransfer.clearData(); // Clear data if dropped outside drop box
        }
    }

    // Color picker functionality for pills
    function showColorPicker(e) {
        if (e.target.classList.contains('delete-btn')) return; // Ignore delete button clicks
        const pill = e.target;
        let currentIndex = parseInt(pill.dataset.colorIndex, 10);
        currentIndex = (currentIndex + 1) % colors.length;
        pill.style.backgroundColor = colors[currentIndex];
        pill.dataset.colorIndex = currentIndex;
    }

    // Delete button functionality
    function addDeleteButton(pill) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'x';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', deletePill);
        pill.appendChild(deleteBtn);
    }

    // Handle delete of pill
    function deletePill(e) {
        const pill = e.target.parentElement;
        const parentBox = pill.parentElement;
        if (parentBox.classList.contains('drop-box')) {
            pill.remove();
        } else {
            //alert('You can only delete pills after they have been dragged into a box.');
        }
    }
});
