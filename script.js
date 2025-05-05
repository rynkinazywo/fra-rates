function getCurrentDate() {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pl-PL', options) + ' r.';
}

document.getElementById('current-date').innerHTML = `<strong>Aktualna data:</strong> ${getCurrentDate()}`;
document.getElementById('last-update').innerHTML = `Ostatnia aktualizacja: ${getCurrentDate()}`;

const upcomingMeetings = {
    "2025-05-06": "upcoming",
    "2025-05-07": "upcoming",
    "2025-06-03": "upcoming",
    "2025-06-04": "upcoming",
    "2025-07-01": "upcoming",
    "2025-07-02": "upcoming",
    "2025-09-02": "upcoming",
    "2025-09-03": "upcoming",
    "2025-10-07": "upcoming",
    "2025-10-08": "upcoming",
    "2025-11-04": "upcoming",
    "2025-11-05": "upcoming",
    "2025-12-02": "upcoming",
    "2025-12-03": "upcoming"
};

let currentDate = new Date(); // Dynamiczne ustawienie bieżącej daty

function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

    document.getElementById("currentMonth").textContent = `${monthNames[month]} ${year}`;

    let calendarHTML = `
        <div class="day">Pn</div><div class="day">Wt</div><div class="day">Śr</div><div class="day">Cz</div><div class="day">Pt</div><div class="day">So</div><div class="day">Nd</div>
    `;

    const startDay = (firstDay === 0) ? 6 : firstDay - 1;
    for (let i = 0; i < startDay; i++) {
        calendarHTML += `<div class="day"></div>`;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let className = upcomingMeetings[dateStr] || "";

        if (year === currentYear && month === currentMonth && day === currentDay && !className) {
            className = "current-day";
        }

        calendarHTML += `<div class="day ${className}">${day}</div>`;
    }

    document.getElementById("calendarDays").innerHTML = calendarHTML;
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    if (currentDate.getFullYear() > 2025) {
        currentDate.setFullYear(2025);
        currentDate.setMonth(11);
    } else if (currentDate.getFullYear() < 2025) {
        currentDate.setFullYear(2025);
        currentDate.setMonth(0);
    }
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

// Inicjalizacja kalendarza z bieżącym miesiącem
generateCalendar(currentDate.getFullYear(), currentDate.getMonth());

function getReferenceRate() {
    const rateText = document.getElementById('reference-rate').textContent.replace(',', '.').replace('%', '');
    return parseFloat(rateText);
}

async function generateCharts() {
    try {
        // Pobieranie danych z fra_rates.json z zapobieganiem buforowaniu
        const response = await fetch('fra_rates.json', {
            cache: 'no-store' // Zapobiega buforowaniu odpowiedzi
        });
        if (!response.ok) {
            throw new Error('Nie udało się pobrać danych z fra_rates.json');
        }
        const data = await response.json();

        // Przetwarzanie danych z formatu klucz-wartość na tablicę liczb
        const fraRates = [
            parseFloat(data["1x4"].replace(',', '.')),
            parseFloat(data["3x6"].replace(',', '.')),
            parseFloat(data["6x9"].replace(',', '.')),
            parseFloat(data["9x12"].replace(',', '.'))
        ];

        // Sprawdzenie poprawności danych
        if (fraRates.length !== 4 || fraRates.some(isNaN)) {
            alert("Dane w fra_rates.json są niepoprawne. Oczekiwano 4 wartości liczbowych.");
            return;
        }

        const referenceRate = getReferenceRate();
        if (isNaN(referenceRate)) {
            alert("Nie udało się pobrać stopy referencyjnej.");
            return;
        }

        const labels = ['1x4', '3x6', '6x9', '9x12'];

        const lineData = {
            labels: labels,
            datasets: [
                {
                    label: 'Stawki FRA',
                    data: fraRates,
                    borderColor: '#d32f2f',
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Stopa referencyjna',
                    data: Array(4).fill(referenceRate),
                    borderColor: '#666',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        };

        const lineConfig = {
            type: 'line',
            data: lineData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: { 
                            display: true, 
                            text: 'Stawka (%)', 
                            color: '#d32f2f', 
                            font: { 
                                size: window.innerWidth <= 768 ? 12 : 16 
                            }
                        },
                        grid: { color: '#ddd' },
                        ticks: { 
                            font: { 
                                size: window.innerWidth <= 768 ? 10 : 14 
                            }
                        }
                    },
                    x: {
                        title: { 
                            display: true, 
                            text: 'Okres FRA', 
                            color: '#d32f2f', 
                            font: { 
                                size: window.innerWidth <= 768 ? 12 : 16 
                            }
                        },
                        grid: { color: '#ddd' },
                        ticks: { 
                            font: { 
                                size: window.innerWidth <= 768 ? 10 : 14 
                            }
                        }
                    }
                },
                plugins: { 
                    legend: { 
                        display: true, 
                        labels: { 
                            color: '#333', 
                            font: { 
                                size: window.innerWidth <= 768 ? 10 : 14 
                            }
                        }
                    }
                }
            }
        };

        const lineCtx = document.getElementById('fra-chart').getContext('2d');
        if (window.fraChart && typeof window.fraChart.destroy === 'function') {
            window.fraChart.destroy();
        }
        window.fraChart = new Chart(lineCtx, lineConfig);

        const differences = fraRates.map(rate => rate - referenceRate);

        const barData = {
            labels: labels,
            datasets: [
                {
                    label: 'Różnica (FRA - Referencyjna)',
                    data: differences,
                    backgroundColor: 'rgba(211, 47, 47, 0.6)',
                    borderColor: 'rgba(211, 47, 47, 1)',
                    borderWidth: 1
                }
            ]
        };

        const barConfig = {
            type: 'bar',
            data: barData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { 
                            display: true, 
                            text: 'Różnica (punkty procentowe)', 
                            color: '#d32f2f', 
                            font: { 
                                size: window.innerWidth <= 768 ? 12 : 16 
                            }
                        },
                        grid: { color: '#ddd' },
                        ticks: { 
                            font: { 
                                size: window.innerWidth <= 768 ? 10 : 14 
                            }
                        }
                    },
                    x: {
                        title: { 
                            display: true, 
                            text: 'Okres FRA', 
                            color: '#d32f2f', 
                            font: { 
                                size: window.innerWidth <= 768 ? 12 : 16 
                            }
                        },
                        grid: { color: '#ddd' },
                        ticks: { 
                            font: { 
                                size: window.innerWidth <= 768 ? 10 : 14 
                            }
                        }
                    }
                },
                plugins: { 
                    legend: { 
                        display: true, 
                        labels: { 
                            color: '#333', 
                            font: { 
                                size: window.innerWidth <= 768 ? 10 : 14 
                            }
                        }
                    }
                }
            }
        };

        const barCtx = document.getElementById('difference-chart').getContext('2d');
        if (window.differenceChart && typeof window.differenceChart.destroy === 'function') {
            window.differenceChart.destroy();
        }
        window.differenceChart = new Chart(barCtx, barConfig);

        generateProbabilityTable(fraRates, referenceRate);
        drawFraChart();
    } catch (error) {
        console.error("Błąd podczas generowania wykresów:", error);
        alert("Wystąpił problem z załadowaniem danych FRA. Sprawdź konsolę, aby zobaczyć szczegóły.");
    }
}

// Automatyczne wywołanie generateCharts po załadowaniu strony
window.addEventListener('load', generateCharts);

function generateProbabilityTable(fraRates, referenceRate) {
    const periods = ['1x4', '3x6', '6x9', '9x12'];
    const step = 0.25;

    const expectedChanges = fraRates.map(rate => rate - referenceRate);

    const minChange = Math.min(...expectedChanges, 0);
    const maxChange = Math.max(...expectedChanges, 0);

    const scenarios = [];
    for (let i = Math.floor(minChange / step) * step; i <= Math.ceil(maxChange / step) * step; i += step) {
        scenarios.push(i);
    }
    scenarios.sort((a, b) => b - a);

    probabilityData = {};
    periods.forEach((period, index) => {
        probabilityData[period] = scenarios.map(scenario => {
            let probability = 0;
            const change = expectedChanges[index];
            const n = Math.floor(change / step);
            const alpha = (change - n * step) / step;

            if (scenario === n * step) {
                probability = (1 - alpha) * 100;
            } else if (scenario === (n + 1) * step) {
                probability = alpha * 100;
            }

            return {
                scenario: `${scenario >= 0 ? '+' : ''}${scenario.toFixed(2)} pp`,
                probability: probability.toFixed(1)
            };
        }).filter(item => item.probability > 0);
    });

    const tableHead = document.getElementById('probability-head');
    const tableBody = document.getElementById('probability-body');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    let headRow = '<tr><th>Scenariusz zmiany (pp)</th>';
    periods.forEach(period => {
        headRow += `<th>${period}</th>`;
    });
    headRow += '</tr>';
    tableHead.innerHTML = headRow;

    scenarios.forEach(scenario => {
        let row = `<tr><td>${scenario >= 0 ? '+' : ''}${scenario.toFixed(2)} pp</td>`;
        expectedChanges.forEach(change => {
            let probability = 0;
            const n = Math.floor(change / step);
            const alpha = (change - n * step) / step;

            if (scenario === n * step) {
                probability = (1 - alpha) * 100;
            } else if (scenario === (n + 1) * step) {
                probability = alpha * 100;
            }

            const alphaValue = probability / 100;
            const cellStyle = `background-color: rgba(211, 47, 47, ${alphaValue * 0.3});`;
            row += `<td class="probability-cell" style="${cellStyle}">${probability.toFixed(1)}%</td>`;
        });
        row += '</tr>';
        tableBody.innerHTML += row;
    });
}

function drawFraChart() {
    const today = new Date();
    const rppMeetings = [
        new Date("2025-05-07"),
        new Date("2025-06-04"),
        new Date("2025-07-02"),
        new Date("2025-09-03"),
        new Date("2025-10-08"),
        new Date("2025-11-05"),
        new Date("2025-12-03")
    ];

    const fraTerms = [
        { term: "1x4", startMonths: 1, endMonths: 4 },
        { term: "3x6", startMonths: 3, endMonths: 6 },
        { term: "6x9", startMonths: 6, endMonths: 9 },
        { term: "9x12", startMonths: 9, endMonths: 12 }
    ];

    const fraDates = fraTerms.map(term => {
        const startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() + term.startMonths);
        const endDate = new Date(today);
        endDate.setMonth(endDate.getMonth() + term.endMonths);
        return { term: term.term, start: startDate, end: endDate };
    });

    const minDate = new Date(today);
    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 12);
    maxDate.setDate(1);

    // Dynamiczne ustawienie szerokości i wysokości wykresu
    const containerWidth = document.querySelector('.chart-container').clientWidth;
    const chartWidth = Math.min(containerWidth - 40, 1000); // Maksymalna szerokość 1000px
    const chartHeight = window.innerWidth <= 768 ? 300 : 600; // Mniejsza wysokość na urządzeniach mobilnych

    const xScaleRange = chartWidth - 150; // Odejmujemy marginesy

    const xScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([0, xScaleRange]);

    const scenarios = Object.keys(probabilityData).flatMap(term => probabilityData[term].map(p => p.scenario));
    const uniqueScenarios = [...new Set(scenarios)].sort((a, b) => parseFloat(b) - parseFloat(a));
    const yScale = d3.scaleBand()
        .domain(uniqueScenarios)
        .range([0, chartHeight - 100]) // Odejmujemy miejsce na osie
        .padding(0.1);

    const svg = d3.select("#fraChart");
    svg.selectAll("*").remove();

    // Ustawienie dynamicznych wymiarów SVG
    svg.attr("width", chartWidth)
       .attr("height", chartHeight);

    svg.append("g")
        .attr("transform", `translate(100, ${chartHeight - 30})`)
        .call(d3.axisBottom(xScale)
            .tickFormat(d => {
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = String(d.getFullYear()).slice(2);
                return `${day}.${month}.${year}`;
            })
            .ticks(d3.timeMonth.every(1)))
        .selectAll("text")
        .style("font-size", window.innerWidth <= 768 ? "8px" : "10px")
        .style("font-family", "'Roboto', sans-serif")
        .attr("transform", "translate(0, 0)");

    svg.append("g")
        .attr("transform", "translate(100, 50)")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", window.innerWidth <= 768 ? "10px" : "14px")
        .style("font-family", "'Roboto', sans-serif");

    const tooltip = d3.select("#tooltip");

    fraDates.forEach(fra => {
        const termProbabilities = probabilityData[fra.term] || [];
        termProbabilities.forEach(prob => {
            if (prob.probability > 0) {
                const yPos = yScale(prob.scenario);
                const blockHeight = yScale.bandwidth();
                const blockWidth = xScale(fra.end) - xScale(fra.start);
                const colorIntensity = prob.probability / 100;

                svg.append("rect")
                    .attr("x", xScale(fra.start) + 100)
                    .attr("y", yPos + 50)
                    .attr("width", blockWidth)
                    .attr("height", blockHeight)
                    .attr("fill", `rgba(211, 47, 47, ${colorIntensity})`)
                    .attr("class", "probability-block")
                    .on("mouseover", function(event) {
                        tooltip.style("display", "block")
                            .html(`Termin: ${fra.term}<br>Scenariusz: ${prob.scenario}<br>Prawdopodobieństwo: ${prob.probability}%`)
                            .style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY - 30) + "px");
                    })
                    .on("mousemove", function(event) {
                        tooltip.style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY - 30) + "px");
                    })
                    .on("mouseout", function() {
                        tooltip.style("display", "none");
                    });
            }
        });
    });

    rppMeetings.forEach(date => {
        const xPos = xScale(date);
        svg.append("line")
            .attr("x1", xPos + 100)
            .attr("x2", xPos + 100)
            .attr("y1", 50)
            .attr("y2", chartHeight - 50)
            .attr("class", "rpp-line")
            .on("mouseover", function(event) {
                tooltip.style("display", "block")
                    .html(`Decyzja RPP: ${date.toLocaleDateString('pl-PL')}`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
            });
    });
}
