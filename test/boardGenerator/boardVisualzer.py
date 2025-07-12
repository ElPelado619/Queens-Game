import pygame
import numpy as np
import os
import glob

# --- CONFIGURACIÓN ---
# Directorio donde se guardaron los tableros generados
BOARD_DIR = "generated_boards" 
# Tamaño de la ventana y de las celdas del tablero
CELL_SIZE = 60
INFO_PANEL_HEIGHT = 50 # Espacio en la parte superior para texto
WINDOW_WIDTH = 9 * CELL_SIZE # Basado en el tablero más grande (9x9)
WINDOW_HEIGHT = 9 * CELL_SIZE + INFO_PANEL_HEIGHT

# --- COLORES ---
# Define un color para cada número de región (del 1 al 9)
# y colores para el fondo, texto, etc.
COLORS = {
    0: (200, 200, 200),  # Color para celdas vacías (si las hubiera)
    -1: (10, 10, 10),      # Color para celdas inalcanzables
    1: (231, 76, 60),    # Rojo
    2: (46, 204, 113),   # Verde
    3: (52, 152, 219),   # Azul
    4: (241, 196, 15),    # Amarillo
    5: (26, 188, 156),    # Turquesa
    6: (155, 89, 182),    # Púrpura
    7: (230, 126, 34),    # Naranja
    8: (52, 73, 94),      # Azul oscuro
    9: (127, 140, 141),   # Gris
}
BACKGROUND_COLOR = (44, 62, 80)
GRID_COLOR = (52, 73, 94)
TEXT_COLOR = (236, 240, 241)

def load_boards_from_files(directory):
    """
    Carga todos los tableros desde los archivos .txt en el directorio especificado.
    Esta versión maneja comas finales y separadores de longitud variable.
    """
    all_boards = []
    file_paths = glob.glob(os.path.join(directory, 'boards*.txt'))
    
    if not file_paths:
        print(f"Error: No se encontraron archivos de tableros en el directorio '{directory}'.")
        print("Asegúrate de ejecutar primero el script 'generador_tableros.py'.")
        return []

    file_paths.sort()

    for path in file_paths:
        try:
            with open(path, 'r') as f:
                current_board_lines = []
                for line in f:
                    line = line.strip()
                    if not line:
                        continue

                    if line.startswith('-') and all(c == '-' for c in line):
                        if current_board_lines:
                            try:
                                # **LA CORRECCIÓN ESTÁ AQUÍ**
                                # Se convierte a número solo si el string no está vacío.
                                board_data = [[int(n) for n in l.split(',') if n] for l in current_board_lines]
                                board = np.array(board_data)
                                # Se verifica que el tablero no esté vacío antes de añadirlo
                                if board.size > 0:
                                    all_boards.append(board)
                            except (ValueError, IndexError) as e:
                                print(f"Advertencia: Se omitió un bloque de tablero malformado en {path}. Error: {e}")
                            current_board_lines = []
                    else:
                        current_board_lines.append(line)
                
                if current_board_lines:
                    try:
                        # **APLICAR LA MISMA CORRECCIÓN AQUÍ**
                        board_data = [[int(n) for n in l.split(',') if n] for l in current_board_lines]
                        board = np.array(board_data)
                        if board.size > 0:
                            all_boards.append(board)
                    except (ValueError, IndexError) as e:
                        print(f"Advertencia: Se omitió un bloque de tablero malformado al final de {path}. Error: {e}")

        except IOError as e:
            print(f"Error al leer el archivo {path}: {e}")
            
    return all_boards

def draw_board(surface, board, offset_x, offset_y):
    """
    Dibuja un tablero en la superficie de Pygame.
    """
    size = board.shape[0]
    for row in range(size):
        for col in range(size):
            color = COLORS.get(board[row, col], (255, 255, 255))
            rect = pygame.Rect(
                offset_x + col * CELL_SIZE, 
                offset_y + row * CELL_SIZE, 
                CELL_SIZE, 
                CELL_SIZE
            )
            pygame.draw.rect(surface, color, rect)

def draw_grid(surface, board_size, offset_x, offset_y):
    """Dibuja las líneas de la cuadrícula del tablero."""
    for i in range(board_size + 1):
        start_pos_ver = (offset_x + i * CELL_SIZE, offset_y)
        end_pos_ver = (offset_x + i * CELL_SIZE, offset_y + board_size * CELL_SIZE)
        pygame.draw.line(surface, GRID_COLOR, start_pos_ver, end_pos_ver, 2)
        start_pos_hor = (offset_x, offset_y + i * CELL_SIZE)
        end_pos_hor = (offset_x + board_size * CELL_SIZE, offset_y + i * CELL_SIZE)
        pygame.draw.line(surface, GRID_COLOR, start_pos_hor, end_pos_hor, 2)

def draw_info_text(surface, text, font):
    """Dibuja texto informativo en el panel superior."""
    text_surface = font.render(text, True, TEXT_COLOR)
    text_rect = text_surface.get_rect(center=(WINDOW_WIDTH / 2, INFO_PANEL_HEIGHT / 2))
    surface.blit(text_surface, text_rect)

def main():
    """Función principal para ejecutar el visualizador de tableros."""
    pygame.init()

    boards = load_boards_from_files(BOARD_DIR)
    if not boards:
        print("No se cargaron tableros. El programa terminará.")
        pygame.quit()
        return

    screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
    pygame.display.set_caption("Visualizador de Tableros de Reinas")
    font = pygame.font.Font(None, 36)
    
    current_board_index = 0
    running = True
    clock = pygame.time.Clock()

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                if event.key == pygame.K_RIGHT:
                    current_board_index = (current_board_index + 1) % len(boards)
                if event.key == pygame.K_LEFT:
                    current_board_index = (current_board_index - 1 + len(boards)) % len(boards)

        screen.fill(BACKGROUND_COLOR)
        
        current_board = boards[current_board_index]
        board_size = current_board.shape[0]
        
        offset_x = (WINDOW_WIDTH - board_size * CELL_SIZE) // 2
        offset_y = INFO_PANEL_HEIGHT + (WINDOW_HEIGHT - INFO_PANEL_HEIGHT - board_size * CELL_SIZE) // 2

        draw_board(screen, current_board, offset_x, offset_y)
        draw_grid(screen, board_size, offset_x, offset_y)
        
        info_text = f"Tablero {current_board_index + 1} de {len(boards)} (← → para cambiar)"
        draw_info_text(screen, info_text, font)

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()

if __name__ == "__main__":
    main()
