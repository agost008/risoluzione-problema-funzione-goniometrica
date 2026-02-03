let draggedElement = null;
let selectedValue = null;

// Gestisci il drag start
document.querySelectorAll('.drag-option').forEach(option => {
    option.addEventListener('dragstart', function(e) {
        draggedElement = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });
    
    option.addEventListener('dragend', function(e) {
        this.classList.remove('dragging');
    });
});

// Gestisci il drop zone
const dropZone = document.getElementById('dropZone');

if (dropZone) {
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (draggedElement) {
            selectedValue = draggedElement.getAttribute('data-value');
            const displayText = draggedElement.textContent;
            
            // Pulisci il feedback
            document.getElementById('feedbackX').innerHTML = '';
            
            // Aggiorna il contenuto della drop zone
            this.innerHTML = `<div class="drop-zone-value">${displayText}</div>`;
            this.classList.add('filled');
        }
    });
}

// Verifica il valore di x
function checkX() {
    if (selectedValue === null) {
        document.getElementById('feedbackX').innerHTML = 
            '<span class="feedback-inline feedback-incorrect">✗ Seleziona un valore prima di verificare</span>';
        return;
    }
    
    const feedbackDiv = document.getElementById('feedbackX');
    const proceedBtn = document.getElementById('proceedBtn');
    
    // Tolleranza per il valore corretto (-π/3 ≈ -1.047)
    const tolerance = 0.1;
    const isCorrect = Math.abs(parseFloat(selectedValue) - (-Math.PI/3)) < tolerance;
    
    feedbackDiv.innerHTML = '';
    
    if (isCorrect) {
        feedbackDiv.innerHTML = '<span class="feedback-inline feedback-correct">✓ Corretto!</span>' +
            '<button class="explanation-btn" onclick="toggleExplanation(\'xExplanation\')">Spiega perché</button>';
        proceedBtn.style.display = 'inline-block';
    } else {
        feedbackDiv.innerHTML = '<span class="feedback-inline feedback-incorrect">✗ Sbagliato</span>' +
            '<button class="explanation-btn" onclick="toggleExplanation(\'xExplanation\')">Perché?</button>';
        proceedBtn.style.display = 'none';
    }
}

// Toggle spiegazione
function toggleExplanation(id) {
    const expl = document.getElementById(id);
    expl.classList.toggle('show');
    const xExpl = document.getElementById('xExplanation');
    if (expl === xExpl) {
        xExpl.style.display = xExpl.classList.contains('show') ? 'block' : 'none';
    }
}

// Toggle flashcard
function toggleFlashcard(card) {
    card.classList.toggle('flipped');
}

// Genera il grafico del dominio
function generateDomainGraph() {
    const x = [];
    const y = [];
    
    for (let i = -4 * Math.PI; i <= 4 * Math.PI; i += 0.05) {
        x.push(i);
        const cosValue = Math.cos(i - Math.PI/3);
        y.push(-4 * cosValue + 2);
    }
    
    const trace = {
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#667eea', width: 3 },
        name: 'f(x) = -4·cos(x - π/3) + 2',
        fill: 'tozeroy',
        fillcolor: 'rgba(141, 211, 244, 0.4)'
    };
    
    // Creo aree separate per il dominio
    const domainAreas = [];
    const intervalliStr = document.querySelector('script[type="application/json"]')?.textContent;
    
    if (intervalliStr) {
        try {
            const intervalli = JSON.parse(intervalliStr);
            
            for (let interval of intervalli) {
                const left = interval[0];
                const right = interval[1];
                const xFill = [];
                const yFill = [];
                for (let i = left; i <= right; i += 0.1) {
                    xFill.push(i);
                    yFill.push(6);
                }
                domainAreas.push({
                    x: xFill,
                    y: yFill,
                    fill: 'tozeroy',
                    fillcolor: 'rgba(132, 250, 176, 0.4)',
                    line: { color: 'transparent' },
                    hoverinfo: 'skip',
                    showlegend: false
                });
            }
        } catch (e) {
            console.log('Errore nel parsing degli intervalli:', e);
        }
    }
    
    const layout = {
        title: 'Dominio della Funzione y = √(2 - 4cos(x - π/3))',
        xaxis: { title: 'x', zeroline: true },
        yaxis: { title: 'f(x)', zeroline: true, range: [-6, 6] },
        hovermode: 'closest',
        plot_bgcolor: '#f9f9f9',
        paper_bgcolor: '#fff',
        font: { family: 'Poppins', size: 12, color: '#333' }
    };
    
    const graphDiv = document.getElementById('graphDomainDiv');
    if (graphDiv) {
        Plotly.newPlot('graphDomainDiv', [trace, ...domainAreas], layout, {responsive: true});
    }
}

// Carica il grafico
window.addEventListener('load', generateDomainGraph);
// Funzione per verificare i parametri della funzione f(x) = a·cos(x - b) + c
function checkFunctionParameters() {
    const inputA = document.getElementById('inputA').value.trim();
    const inputB = document.getElementById('inputB').value.trim();
    const inputC = document.getElementById('inputC').value.trim();
    
    const feedbackDiv = document.getElementById('feedbackParameters');
    const complimentBox = document.getElementById('complimentBox');
    
    // Valori corretti
    const correctA = -4;
    const correctC = 2;
    
    // Normalizza il valore di b: può essere "-pi/3", "-π/3", "1.047", ecc.
    function normalizeB(value) {
        // Se contiene pi o π
        if (value.includes('pi') || value.includes('π')) {
            // Sostituisci pi/π con il valore numerico
            let normalized = value.toLowerCase().replace(/π|pi/g, Math.PI.toString());
            // Valuta l'espressione
            try {
                return eval(normalized);
            } catch {
                return null;
            }
        } else {
            // Tenta di convertire a numero
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
        }
    }
    
    // Normalizza gli input
    let numA = parseFloat(inputA);
    let numB = normalizeB(inputB);
    let numC = parseFloat(inputC);
    
    // Valida gli input
    let allCorrect = true;
    let errorMessages = [];
    
    feedbackDiv.innerHTML = '';
    complimentBox.style.display = 'none';
    
    if (isNaN(numA)) {
        allCorrect = false;
        errorMessages.push("❌ Il valore di 'a' non è valido. Inserisci un numero");
    } else if (numA !== correctA) {
        allCorrect = false;
        errorMessages.push(`❌ Il valore di 'a' non è corretto.`);
    } else {
        errorMessages.push("✅ Perfetto! Il valore di 'a' è corretto!");
    }
    
    if (numB === null) {
        allCorrect = false;
        errorMessages.push("❌ Il valore di 'b' non è valido. Inserisci un numero o un'espressione con pi");
    } else {
        const correctBValue = -Math.PI / 3; // -π/3 ≈ -1.047
        const tolerance = 0.001; // Tolleranza per confronto floating point
        if (Math.abs(numB - correctBValue) <= tolerance) {
            errorMessages.push("✅ Perfetto! Il valore di 'b' è corretto!");
        } else {
            allCorrect = false;
            errorMessages.push(`❌ Il valore di 'b' non è corretto.`);
        }
    }
    
    if (isNaN(numC)) {
        allCorrect = false;
        errorMessages.push("❌ Il valore di 'c' non è valido. Inserisci un numero");
    } else if (numC !== correctC) {
        allCorrect = false;
        errorMessages.push(`❌ Il valore di 'c' non è corretto.`);
    } else {
        errorMessages.push("✅ Perfetto! Il valore di 'c' è corretto!");
    }
    
    // Mostra i messaggi di feedback
    errorMessages.forEach(msg => {
        const p = document.createElement('p');
        p.style.cssText = 'margin: 10px 0; font-size: 1rem; font-weight: 500;';
        if (msg.includes('✅')) {
            p.style.color = '#27ae60';
        } else if (msg.includes('❌')) {
            p.style.color = '#e74c3c';
        }
        p.innerHTML = msg;
        feedbackDiv.appendChild(p);
    });
    
    // Mostra il complimento se tutti i valori sono corretti
    if (allCorrect) {
        complimentBox.style.display = 'block';
        complimentBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Funzione per toggle della lampadina e spiegazione coseno
function toggleCosineExplanation() {
    const explanation = document.getElementById('cosine-explanation');
    const lightbulb = document.getElementById('lightbulb-icon');
    
    if (explanation.style.display === 'none') {
        explanation.style.display = 'block';
        lightbulb.style.transform = 'rotate(20deg) scale(1.2)';
        lightbulb.style.filter = 'brightness(1.3)';
    } else {
        explanation.style.display = 'none';
        lightbulb.style.transform = 'rotate(0deg) scale(1)';
        lightbulb.style.filter = 'brightness(1)';
    }
}

// Funzione per continuare con l'esercizio e mostrare i passaggi matematici
function proceedWithExercise(exerciseNum) {
    const mathStepsId = 'mathStepsExercise' + exerciseNum;
    const mathStepsDiv = document.getElementById(mathStepsId);
    if (mathStepsDiv) {
        mathStepsDiv.style.display = 'block';
        mathStepsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Mostra il bottone "Continua all'Esercizio" corrispondente
    const continueBtn = document.getElementById('continueBtn' + exerciseNum);
    if (continueBtn) {
        continueBtn.style.display = 'block';
        continueBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Funzione per continuare con l'esercizio e mostrare il prossimo
function continueToExercise(exerciseNum) {
    // Nascondi l'esercizio corrente e mostra il prossimo
    const currentExercise = document.getElementById('exercise-' + (exerciseNum - 1));
    const nextExercise = document.getElementById('exercise-' + exerciseNum);
    
    if (currentExercise) {
        currentExercise.style.display = 'none';
    }
    if (nextExercise) {
        nextExercise.style.display = 'block';
        nextExercise.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}