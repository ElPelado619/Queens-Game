import random

def printBoard(board):
    """
    Prints the board in a readable format.
    Each row is printed on a new line, with values separated by spaces.
    """
    for row in board:
        print(" ".join(str(col) for col in row))
    print()  # Print an empty line after the board for better readability

def isAdjacent(row1, row2, col1, col2):
    """
    Determines if two cells (row1, col1) and (row2, col2) are adjacent or in the same row or column.
    Returns True if the cells are adjacent (including diagonally), or share the same row or column.
    """
    return (abs(row1 - row2) <= 1 and abs(col1 - col2) <= 1) \
            or (row1 == row2) or (col1 == col2)


def isNeighbor(row1, col1, row2, col2):
    """
    Checks if two cells are direct neighbors (horizontally or vertically adjacent).
    Returns True if the cells are in the same row or column and are next to each other.
    """
    return (row1 == row2 and abs(col1 - col2) <= 1) \
            or (col1 == col2 and abs(row1 - row2) <= 1)


def isSafe(board, row, col, excludeItself=False):
    """
    Checks if placing a queen at (row, col) is safe.
    A position is safe if there are no adjacent queens (including diagonals, same row, or same column).
    Returns True if safe, False otherwise.
    """
    listOfAdjacent = [(row2, col2) 
                      for row2 in range(len(board)) 
                      for col2 in range(len(board)) 
                      if isAdjacent(row, row2, col, col2)]
    adjacentQueens = [board[row2][col2] for row2, col2 in listOfAdjacent if board[row2][col2] >= 1]
    
    if excludeItself:
        adjacentQueens = [q for q in adjacentQueens if q != board[row][col]]
    
    return len(adjacentQueens) == 0


def placeInitialQueens(board, row):
    """
    Recursively places queens on the board, one per row, ensuring no two queens threaten each other.
    Returns the board with queens placed, or None if not possible.
    """
    if row >= len(board):
        return board

    possibleCols = [col for col in range(len(board)) if board[row][col] == 0]
    
    randomCol = random.choice(possibleCols) if possibleCols else None
    while randomCol is not None:
        if isSafe(board, row, randomCol):
            board[row][randomCol] = row + 1
            genBoard = placeInitialQueens(board, row + 1)
            if genBoard is not None:
                return genBoard
        
        board[row][randomCol] = 0
        possibleCols.remove(randomCol)
        randomCol = random.choice(possibleCols) if possibleCols else None
        
    return None
    
    
def initialDomain(board, row, col):
    """
    Returns the possible values (domain) for a cell.
    If the cell is filled, returns its value as a single-element list.
    Otherwise, returns a list of all possible queen numbers (1 to BOARD_SIZE).
    """
    if board[row][col] != 0:
        return [board[row][col]]
    
    return [x+1 for x in range(BOARD_SIZE)]

def onlyQueenInRegion(regionBoard, queensBoard, row, col):
    """
    Checks if the cell at (row, col) is the only queen in its region.
    A region is defined as a row in this context.
    Returns True if the cell is the only queen in its row, False otherwise.
    """
    regionColor = regionBoard[row][col]
    
    region = [(regionRow,regionCol) for regionRow in range(len(regionBoard))
              for regionCol in range(len(regionBoard[0]))
              if regionBoard[regionRow][regionCol] == regionColor]
    
    queensPlacementsInRegion = [(queenRow, queenCol)
                                for queenRow, queenCol in region
                                if queensBoard[queenRow][queenCol] > 0]
    
    return len(queensPlacementsInRegion) == 1

def findSolutions(regionBoard, queensBoard, row):
    """
    Recursively finds all solutions for the board starting from a given row.
    Returns the count of valid solutions found.
    """
    
    solutionsCount = 0
    
    if row >= len(regionBoard):
        return 1
    
    validPlacements = [col for col in range(len(regionBoard)) if regionBoard[row][col] > 0]
    
    for col in validPlacements:
        queensBoard[row][col] = 1
        
        if isSafe(queensBoard, row, col, excludeItself=True) and onlyQueenInRegion(regionBoard, queensBoard, row, col):
            solutionsCount += findSolutions(regionBoard, queensBoard, row + 1)
        
        queensBoard[row][col] = 0
        
    return solutionsCount

def testIfColorIsValid(board, row, col, value):
    """
    Placeholder function to test if a color is valid.
    This function should contain the logic to validate the color based on the game's rules.
    Currently, it does nothing and is a work in progress.
    """
    
    board[row][col] = value
    
    queensBoard = [[0 for _ in range(len(board))] for _ in range(len(board))]
    
    solutionsCount = findSolutions(regionBoard=board, queensBoard=queensBoard, row = 0)
    
    board[row][col] = 0
    
    if solutionsCount > 0:
        return True
    
    return False


def createRegions(board):
    """
    Creates a domain map for the board, identifies painted (filled) cells, and explores neighboring cells for further processing.
    The region creation logic is currently incomplete (work in progress).
    """
    domainMap = {(row, col): initialDomain(board, row, col) for row in range(len(board))
                 for col in range(len(board))}
    
    print("Domain map created:")
    for (row, col), values in domainMap.items():
        print(f"Cell ({row}, {col}): {values}")
        
    paintedCells = [(row, col) for row in range(len(board))
                    for col in range(len(board))
                    if board[row][col] >= 1]
    
    while paintedCells != []:
        rowRandom, colRandom = random.choice(paintedCells)
        
        # Select neighoring cells that are not painted
        neighboringCells = [(row2, col2)
                            for row2 in range(len(board))
                            for col2 in range(len(board))
                            if isNeighbor(rowRandom, colRandom, row2, col2)
                            and not (row2 == rowRandom and col2 == colRandom)
                            and board[row2][col2] == 0]
        
        print(f"Neighboring cells for ({rowRandom}, {colRandom}): {neighboringCells}")
        
        # If all neighboring cells are painted
        if neighboringCells == []:
            paintedCells.remove((rowRandom, colRandom))
            continue
        
        rowNeighbor, colNeighbor = random.choice(neighboringCells)
        
        neighborDomain = domainMap[(rowNeighbor, colNeighbor)]
        
        randomColor = board[rowRandom][colRandom]
        neighborColor = board[rowNeighbor][colNeighbor]
        
        # If neighbor cell is not painted and randomColor is in possible values
        if neighborColor == 0 and randomColor in neighborDomain:
            colorIsValid = testIfColorIsValid(board, rowNeighbor, colNeighbor, randomColor)
            
            if colorIsValid:
                board[rowNeighbor][colNeighbor] = randomColor
                paintedCells.append((rowNeighbor, colNeighbor))
            else:
                domainMap[(rowNeighbor, colNeighbor)].remove(randomColor)
                
        printBoard(board)
        print("-"*20)  
                
    return board


if __name__ == "__main__":    
    BOARD_SIZE = 7

    board = [[0 for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]

    board = placeInitialQueens(board, row = 0)

    print("Initial board with queens placed:")
    printBoard(board)
        
    board = createRegions(board)
    
    print("Board after creating regions:")
    printBoard(board)