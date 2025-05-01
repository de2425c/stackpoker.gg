from pydantic import BaseModel
from typing import List, Optional


class GameInfo(BaseModel):
    table_size: int
    small_blind: float
    big_blind: float
    dealer_seat: int

class Player(BaseModel):
    name: str
    seat: int
    stack: float
    position: Optional[str]
    is_hero: bool
    cards: Optional[List[str]]
    final_hand: Optional[str] = None  # e.g., "Pair of Kings"
    final_cards: Optional[List[str]] = None  # e.g., ["Kh", "Kd", "Ah", "7d", "2c"]

class Action(BaseModel):
    player_name: str
    action: str
    amount: float
    cards: Optional[List[str]]

class Street(BaseModel):
    name: str
    cards: List[str]
    actions: List[Action]

class PotDistribution(BaseModel):
    player_name: str
    amount: float
    hand: str  # e.g., "Pair of Kings"
    cards: List[str]  # e.g., ["Kh", "Kd", "Ah", "7d", "2c"]

class Pot(BaseModel):
    amount: float
    distribution: List[PotDistribution]
    hero_pnl: float

class RawHandHistory(BaseModel):
    game_info: GameInfo
    players: List[Player]
    streets: List[Street]
    pot: Pot

class HandHistory(BaseModel):
    raw: RawHandHistory

