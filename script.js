

// --- RENDERING -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    const root = document.getElementById('penal-code-root');
    if (!root) return;

    Object.keys(penalCode)
        .sort((a, b) => Number(a) - Number(b))
        .forEach(categoryKey => {
            const category = penalCode[categoryKey];
            if (!Array.isArray(category) || category.length === 0) return;

            const section = document.createElement('section');
            section.className = 'category';

            const header = document.createElement('div');
            header.className = 'category-header';

            const titleText = categorySubtitles[categoryKey] || `Category ${categoryKey}`;
            header.textContent = titleText;

            section.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'charges-grid';

            category.forEach(charge => {
                const card = document.createElement('div');
                card.className = 'charge-card';

                // Color strip + subtle background tint from charge.color
                if (charge.color) {
                    card.style.borderLeftColor = charge.color;

                    const bgMap = {
                        green: 'rgba(34, 197, 94, 0.10)',
                        orange: 'rgba(249, 115, 22, 0.10)',
                        red: 'rgba(239, 68, 68, 0.10)'
                    };

                    const tint = bgMap[charge.color] || 'rgba(15, 23, 42, 0.9)';
                    card.style.background = `linear-gradient(135deg, ${tint}, rgba(15, 23, 42, 0.95))`;
                }

                const titleRow = document.createElement('div');
                titleRow.className = 'charge-title-row';

                const titleEl = document.createElement('div');
                titleEl.className = 'charge-title';
                titleEl.textContent = charge.title;

                const idEl = document.createElement('div');
                idEl.className = 'charge-id';
                idEl.textContent = charge.id || '';

                titleRow.appendChild(titleEl);
                titleRow.appendChild(idEl);

                const meta = document.createElement('div');
                meta.className = 'charge-meta';
                meta.innerHTML =
                    `<span><strong>Months:</strong> ${charge.months}</span>` +
                    `<span><strong>Fine:</strong> $${charge.fine}</span>`;

                const classPill = document.createElement('div');
                classPill.className =
                    'charge-class-pill ' + String(charge.class || '').toLowerCase();
                classPill.textContent = charge.class;

                // Tooltip for description on hover
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';

                const tooltipTitle = document.createElement('div');
                tooltipTitle.className = 'tooltip-title';
                tooltipTitle.textContent = charge.title;

                const tooltipBody = document.createElement('div');
                tooltipBody.className = 'tooltip-body';
                tooltipBody.textContent = charge.description || 'No description provided.';

                tooltip.appendChild(tooltipTitle);
                tooltip.appendChild(tooltipBody);

                // Expanded content (created once, shown only when card is expanded)
                const expandedContent = document.createElement('div');
                expandedContent.className = 'expanded-content';
                expandedContent.innerHTML = `
                    <div class="expanded-title">${charge.title}</div>
                    <div class="expanded-description">${charge.description || 'No description provided.'}</div>
                    <div class="expanded-details">
                        <span><strong>Jail Time:</strong> ${charge.months} months</span>
                        <span><strong>Fine:</strong> $${charge.fine}</span>
                        <span id = "expanded-class-pill"><strong>Class:</strong> ${charge.class}</span>
                    </div>
                `;

                card.appendChild(titleRow);
                card.appendChild(meta);
                card.appendChild(classPill);
                card.appendChild(tooltip);
                card.appendChild(expandedContent);

                // searchable only by title + code (id) + class
                card.dataset.search = [
                    charge.title,
                    charge.id,      // e.g. "P.C. 1001"
                    charge.class    // e.g. "Felony", "Misdemeanor", "Infraction"
                ].join(' ').toLowerCase();

                // Click to expand/collapse
                card.addEventListener("click", () => {
                    const alreadyExpanded = card.classList.contains("expanded");
                    const thisContent = card.querySelector('.expanded-content');

                    // Collapse all other expanded cards
                    document.querySelectorAll(".charge-card.expanded").forEach(c => {
                        if (c === card) return;
                        c.classList.remove("expanded");
                        const content = c.querySelector('.expanded-content');
                        if (content) {
                            content.style.height = '0px';
                            content.style.opacity = '0';
                            content.style.marginTop = '0';
                        }
                    });

                    if (alreadyExpanded) {
                        // collapse this one
                        card.classList.remove("expanded");
                        if (thisContent) {
                            thisContent.style.height = '0px';
                            thisContent.style.opacity = '0';
                            thisContent.style.marginTop = '0';
                        }
                    } else {
                        // expand this one
                        card.classList.add("expanded");
                        if (thisContent) {
                            const fullHeight = thisContent.scrollHeight;
                            thisContent.style.height = fullHeight + 'px';
                            thisContent.style.opacity = '1';
                            thisContent.style.marginTop = '12px';
                        }
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });


                grid.appendChild(card);
            });

            section.appendChild(grid);
            root.appendChild(section);
        });

    // --- SEARCH / FILTER ----------------------------------------------------
    const searchInput = document.getElementById('charge-search');
    const noResultsEl = document.getElementById('no-results');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();

            const cards = document.querySelectorAll('.charge-card');
            cards.forEach(card => {
                const haystack = card.dataset.search || '';
                if (!query || haystack.includes(query)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });

            // Hide/show whole categories depending on whether they have visible cards
            const categories = document.querySelectorAll('.category');
            categories.forEach(categoryEl => {
                const hasVisible = categoryEl.querySelector('.charge-card:not(.hidden)');
                if (!query || hasVisible) {
                    categoryEl.classList.remove('hidden');
                } else {
                    categoryEl.classList.add('hidden');
                }
            });

            // Show "No charges found" if nothing matches
            if (noResultsEl) {
                const anyVisibleCard = document.querySelector('.charge-card:not(.hidden)');
                if (query && !anyVisibleCard) {
                    noResultsEl.classList.remove('hidden');
                } else {
                    noResultsEl.classList.add('hidden');
                }
            }
        });
    }

});

