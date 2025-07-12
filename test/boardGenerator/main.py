import numpy as np
import random
import os

def is_valid_pos(board, row, col):
    """
    Función que verifica si una reina es válida en una posición.
    Esta es una versión simplificada basada en el pseudocódigo, que previene
    que las reinas sean adyacentes. No es la restricción completa del problema N-Queens.

    Args:
        board (np.array): El tablero de juego.
        row (int): El índice de la fila a verificar.
        col (int): El índice de la columna a verificar.

    Returns:
        bool: True si la posición es válida, False en caso contrario.
    """
    size = board.shape[0]

    # Verificar si ya hay una reina en la fila
    if np.sum(board[row, :]) > 0:
        return False

    # Verificar si ya hay una reina en la columna
    if np.sum(board[:, col]) > 0:
        return False

    # Definir los límites para el vecindario 3x3
    row_start = max(0, row - 1)
    row_end = min(size, row + 2)
    col_start = max(0, col - 1)
    col_end = min(size, col + 2)

    # Verificar si hay reinas en el vecindario 3x3 circundante
    if np.sum(board[row_start:row_end, col_start:col_end]) > 0:
        return False

    return True

def set_initial_queens(board):
    """
    Función que se encarga de colocar las reinas iniciales en el tablero,
    una por cada fila.

    Args:
        board (np.array): El tablero de juego a modificar.

    Returns:
        np.array: El tablero con las reinas iniciales colocadas.
    """
    size = board.shape[0]
    for r in range(size):
        # Crear una lista de posibles columnas para colocar la reina
        possible_columns = list(range(size))
        random.shuffle(possible_columns) # Barajar para aleatoriedad

        placed = False
        for c in possible_columns:
            if is_valid_pos(board, r, c):
                # Coloca la reina, usando el número de fila + 1 como "color"
                board[r, c] = r + 1
                placed = True
                break
        
        if not placed:
            # Esto podría ocurrir si las reinas anteriores bloquean todas las posiciones.
            # Para un script robusto, se podría necesitar una estrategia de backtracking.
            # Por ahora, lanzamos un error o advertencia.
            print(f"Advertencia: No se pudo colocar una reina en la fila {r} para un tablero de tamaño {size}x{size}.")
            # Podríamos devolver None para indicar un fallo en la generación
            return None
            
    return board

def create_regions(board):
    """
    Expande las regiones desde las reinas iniciales para llenar todo el tablero.

    Args:
        board (np.array): El tablero con las reinas iniciales.

    Returns:
        np.array: El tablero completo con todas las regiones pintadas.
    """
    if board is None:
        return None

    size = board.shape[0]
    # Obtener las coordenadas de las celdas ya pintadas (donde están las reinas)
    painted_cells = list(zip(*np.where(board > 0)))

    # Continuar mientras haya celdas vacías (con valor 0)
    while np.sum(board == 0) > 0:
        cells_to_add = []
        # Barajar las celdas pintadas para un crecimiento más orgánico de las regiones
        random.shuffle(painted_cells)

        made_change_in_pass = False
        for r, c in painted_cells:
            neighbors = []
            # Revisar solo los vecinos arriba, abajo, izquierda y derecha (no diagonales)
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    
                nr, nc = r + dr, c + dc

                # Verificar si el vecino está dentro de los límites y no está pintado
                if 0 <= nr < size and 0 <= nc < size and board[nr, nc] == 0:
                    neighbors.append((nr, nc))
            
            if neighbors:
                # Elegir un vecino al azar para pintar
                nr, nc = random.choice(neighbors)
                board[nr, nc] = board[r, c]
                # Añadir la nueva celda pintada a una lista temporal
                cells_to_add.append((nr, nc))
                made_change_in_pass = True

        # Añadir todas las nuevas celdas pintadas a la lista principal
        painted_cells.extend(cells_to_add)
        
        # Si en una pasada completa no se pintó ninguna celda, hay regiones aisladas.
        # Rompemos el bucle para evitar un bucle infinito.
        if not made_change_in_pass and np.sum(board == 0) > 0:
            # print("Advertencia: No se pudo completar el tablero. Rellenando celdas restantes.")
            # Opcional: Rellenar las celdas restantes con un valor, por ejemplo -1
            board[board == 0] = -1 # Marcar como inalcanzable
            break

    return board

def generate_board(size):
    """
    Función que se encarga de generar un tablero completo con todas las regiones
    dado un tamaño de tablero.

    Args:
        size (int): El tamaño del tablero (ej. 7 para un tablero de 7x7).

    Returns:
        np.array: El tablero generado.
    """
    # Inicializar con ceros
    board = np.zeros((size, size), dtype=int)
    # Colocar reinas iniciales
    board_with_queens = set_initial_queens(board)
    # Extender las regiones del tablero
    full_board = create_regions(board_with_queens)
    return full_board

def format_board_to_string(board):
    """
    Convierte un tablero numpy en una cadena de texto formateada.
    """
    if board is None:
        return "Generación de tablero fallida.\n"
    
    # Usa np.savetxt para formatear el array fácilmente
    # El delimitador es un tabulador para un espaciado consistente
    return np.array2string(board, separator=',', max_line_width=np.inf)\
        .replace('[', '').replace(']', '').replace(' ', '')


def main():
    """
    Script principal que se encarga de crear los tableros y guardarlos 
    en los archivos txt correspondientes.
    """
    # Definir los tipos de tablero y los archivos de salida
    board_types = [(7, 'boards7.txt'), (8, 'boards8.txt'), (9, 'boards9.txt')]
    num_boards_to_generate = 10 # Reducido de 1000 para una ejecución más rápida

    print(f"Generando {num_boards_to_generate} tableros para cada tamaño...")

    for size, filename in board_types:
        # Asegurarse de que el directorio para los tableros exista
        output_dir = "generated_boards"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        filepath = os.path.join(output_dir, filename)

        # Usar 'with' para manejar el archivo de forma segura
        try:
            with open(filepath, 'w') as f:
                print(f"Creando archivo: {filepath}")
                boards_generated = 0
                while boards_generated < num_boards_to_generate:
                    board = generate_board(size=size)
                    if board is not None:
                        # Escribir el tablero formateado en el archivo
                        board_str = format_board_to_string(board)
                        f.write(board_str + '\n')
                        f.write('-' * (size * 3) + '\n') # Separador
                        boards_generated += 1
        except IOError as e:
            print(f"Error al escribir en el archivo {filepath}: {e}")

    print("¡Proceso completado!")
    print(f"Los tableros generados se han guardado en la carpeta '{output_dir}'.")

# Punto de entrada del script
if __name__ == "__main__":
    main()
