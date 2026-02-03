from flask import Flask, render_template, request
import math

app = Flask(__name__)

# ============ FUNZIONI TRIGONOMETRICHE ============

def f(x, a):
    """f(x) = a*cos(x - pi/3) + 2"""
    return a * math.cos(x - math.pi/3) + 2

def compute_a_trig():
    """
    Calcola a tale che f(-pi/3) = 4.
    cos(-pi/3 - pi/3) = cos(-2pi/3) = -1/2
    a * (-1/2) + 2 = 4  =>  a = -4
    """
    return -4.0

def zeros_trig(k_range=range(-2, 3)):
    """
    Zeri di f(x) = -4*cos(x-pi/3) + 2
    Risolvere cos(x-pi/3) = 1/2
    x = 2*k*pi  oppure  x = 2*pi/3 + 2*k*pi
    """
    sols = []
    for k in k_range:
        sols.append(2 * k * math.pi)
        sols.append(2 * math.pi/3 + 2 * k * math.pi)
    return sorted(sols)

def domain_intervals_trig(k_range=range(-2, 3)):
    """
    Dominio di y = sqrt(2 - 4*cos(x-pi/3))
    Richiede 2 - 4*cos(x-pi/3) >= 0  =>  cos(x-pi/3) <= 1/2
    Per theta = x-pi/3: theta in [pi/3 + 2*k*pi, 5*pi/3 + 2*k*pi]
    In x: intervalli [2*pi/3 + 2*k*pi, 2*pi + 2*k*pi]
    """
    intervals = []
    for k in k_range:
        left = 2 * math.pi/3 + 2 * k * math.pi
        right = 2 * math.pi + 2 * k * math.pi
        intervals.append((left, right))
    return intervals


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/teoria', methods=['GET'])
def teoria():
    """Mostra la pagina con la teoria."""
    return render_template('Teoria.html')

@app.route('/trig', methods=['GET'])
def trig_solve():
    """Risolve il problema trigonometrico e mostra i risultati."""
    a = compute_a_trig()
    
    # Calcola zeri
    zeri = zeros_trig()
    zeri_str = [f"{z:.4f}" for z in zeri]
    
    # Calcola intervalli dominio
    intervalli = domain_intervals_trig()
    intervalli_str = [f"[{left:.4f}, {right:.4f}]" for left, right in intervalli]
    intervalli_num = intervalli  # Numeri puri per il grafico
    
    # Verifica
    verifica_x = -math.pi/3
    verifica_y = f(verifica_x, a)
    
    results = {
        'a': a,
        'punto_verifica': f"f(-π/3) = {verifica_y:.6f} (atteso: 4)",
        'zeri': zeri_str,
        'zeri_num': zeri,  # Numeri per il grafico
        'intervalli': intervalli_str,
        'intervalli_num': intervalli_num,  # Numeri per il grafico
        'formula_f': "f(x) = -4·cos(x - π/3) + 2",
        'formula_dominio': "y = √(2 - 4·cos(x - π/3))"
    }
    
    return render_template('trig.html', results=results)

if __name__ == '__main__':
    app.run(debug=True)