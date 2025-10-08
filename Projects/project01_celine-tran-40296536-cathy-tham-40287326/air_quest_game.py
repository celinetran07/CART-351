"""
AirQuest: An interactive game that lets players explore air quality around the world.
Players travel to different cities and experience the effects of air pollution on their health.
The game uses real-time air quality data from the WAQI API.
"""
import time
import requests
from colorama import init
from pyfiglet import Figlet
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

# Initialize
init(autoreset=True)
console = Console()
TOKEN = "49c2146024156e70b8b3fe2aba9bd659aa6d503b"

def cprint(text, color=""):
    """
    Helper function to print centered text with color.

    Args:
        text (str): The text to print.
        color (str, optional): The color/style to apply. Defaults to "".
    """
    console.print(text, style=color, justify="center")

# ASCII Art for each state
ASCII_ART = {
    "Good": (r"""
    ;   :   ;
   .   \_,!,_/   ,
    `.,'     `.,'
    /         \
    ~ --:           : -- ~
    \         /
    ,'`._   _.'`.
   '   / `!` \   `
    ;   :   ;  
    """, "yellow"),

    "Moderate": (r"""
|
\     |     /
\       /
           ,d8b,       ._
 (')-")_--- 88888 ---.-(`  )
('-  (. ')     98P'    :(     )) 
 '-.(   )'   /    \   `(    )  ))
         /   .')  \   ` __.:' 
(_  ) 
    """, "cyan"),

    "Unhealthy for Sensitive Groups": (r"""
                                   
           (`  ).                   _           
             (     ).              .:(`  )`.       
             (       '`.          :(   .    )      
        .=(`(      .   )    .--  `.  (    ) )      
       ((    (..__.:'-'   .+(   )   ` _`  ) )                 
`.     `(       ) )       (   .  )     (   )  ._   
  )      ` __.:'   )     (   (   ))     `-'.-(`  ) 
)  )  ( )       --'       `- __.'         :(      )) 
.-'  (_.'          .')                    `(    )  ))
                  (_  )                     ` __.:'        
    """, "yellow"),

    "Unhealthy": (r"""
  .-~~~-.
  .- ~ SMOG ~ -.
 (  .-~~~~~-.  )
 ~~         ~~
 ___]___
 |_______|
 |   |
    """, "red"),

    "Hazardous": (r"""
     .-.   .-.   .-.
    (   )-(   )-(   )
     `~'   `~'   `~'
    POLLUTION
    _____
    /     \
    | () () |
    \  ^  /
    |||||
    |||||
    """, "magenta")
}


def get_air_mood(aqi):
    """
    Returns a poetic mood message based on the AQI value.
    
    :param aqi: Air Quality Index value
    :return: Tuple of (mood message, color, state)
    """
    if aqi <= 50:
        return "🌿 Clean and Fresh! You breathe poetry and calm skies.", "green", "Good"
    elif aqi <= 100:
        return "🌤️  Slightly polluted! A hint of industry in your lungs.", "yellow", "Moderate"
    elif aqi <= 150:
        return "😷 The air tastes industrial. You inhale capitalism.", "red", "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "🔥 Thick smog! The sky weeps grey tears of despair.", "red", "Unhealthy"
    else:
        return "☠️  Toxic air! You taste the end of breathable hope.", "magenta", "Hazardous"


def get_air_data(city):
    """
    Fetches the air quality index for a given city using the API.
    
    :param city: City name
    :return: AQI value or None if not found
    """
    url = f"https://api.waqi.info/feed/{city}/?token={TOKEN}"
    response = requests.get(url, timeout=10).json()
    if response["status"] != "ok":
        return None
    return response["data"]["aqi"]


def health_loss(aqi, wearing_mask):
    """
    Calculate health loss based on AQI and mask usage.
    
    :param aqi: Air Quality Index value
    :param wearing_mask: Boolean indicating if the player is wearing a mask
    :return: Health points lost
    """
    if aqi <= 50:
        return 0
    elif aqi <= 100:
        return 0  # No health loss in Moderate air
    elif aqi <= 150:
        return 10 if wearing_mask else 20
    elif aqi <= 200:
        return 15 if wearing_mask else 30
    else:
        return 25 if wearing_mask else 40


def restore_health(health, aqi):
    """
    Restore health if the air quality is good.
    
    :param health: Current health
    :param aqi: Air Quality Index value
    :return: New health value
    """
    if aqi <= 50:
        heal = 10
        new_health = min(100, health + heal)
        if new_health > health:
            cprint(f"🌿 The clean air rejuvenates you! +{new_health - health} health.", "green")
        else:
            cprint("💪 You already feel perfectly healthy!", "green")
        return new_health
    return health


def display_health(health):
    """
    Displays the health bar with color coding.
    
    :param health:  Current health value (0-100)
    :return: None
    """
    bar_length = 20
    filled = int((health / 100) * bar_length)
    health_bar = "█" * filled + "-" * (bar_length - filled)

    if health > 60:
        color = "green"
    elif health > 50:
        color = "yellow"
    elif health > 20:
        color = "orange1"
    else:
        color = "red"
    cprint(f"❤️  Health: [{health_bar}] {health}%", color)


def intro():
    """
    Displays the game title and welcome message.
    """
    f = Figlet(font="slant")
    cprint(f.renderText("AirQuest"), "bold cyan")
    cprint("🎮 Welcome to the AirQuest Adventure Game! 🎮", "bold")
    cprint("Travel the world, breathe the air, and try to stay alive...\n")


def loading_animation(message="Fetching air quality data..."):
    """
    Displays a loading animation with a spinner and progress bar.
    
    :param message: Message to display during loading
    :return: None
    """
    with Progress(
        SpinnerColumn(spinner_name="earth"),
        TextColumn(f"[cyan]{message}"),
        console=console,
        transient=True
    ) as progress:
        task = progress.add_task("", total=100)
        for _ in range(100):
            time.sleep(0.02)
            progress.update(task, advance=1)


def get_state_color(aqi):
    """
    Determine display color based on AQI value.
    
    Args:
        aqi (int): Air Quality Index value
    Returns:
        str: Color name for display
    """
    if aqi <= 50:
        return "green"
    elif aqi <= 100:
        return "yellow"
    elif aqi <= 200:
        return "red"
    else:
        return "magenta"

def display_city_info(city, aqi, state, mood):
    """
    Display city information and ASCII art.
    
    Args:
        city (str): City name
        aqi (int): Air Quality Index
        state (str): Air quality state
        mood (str): Mood message
    """
    state_color = get_state_color(aqi)
    art, art_color = ASCII_ART[state]
    cprint("\n───────────────────────────────────────────────", "cyan")
    cprint(f"📍 City: {city} \n")
    cprint(f"💨 Air Quality Index: {aqi}/500")
    cprint(f"State: [{state}]", state_color)
    cprint(art, art_color)
    cprint("───────────────────────────────────────────────", "cyan")
    cprint(mood[0], mood[1])
    cprint("───────────────────────────────────────────────", "cyan")

def handle_mask_choice(aqi):
    """
    Handle mask wearing choice for high AQI values.
    
    Args:
        aqi (int): Air Quality Index value
    Returns:
        bool: Whether player chose to wear mask
    """
    if aqi <= 100:
        return False
    cprint("Do you wear a mask? (yes/no)", "yellow bold")
    mask_choice = input(" " * (console.width // 2 - 4) + ">> ").lower().strip()
    wearing_mask = mask_choice in ["yes", "y"]
    if aqi <= 150 and wearing_mask:
        cprint("Wise choice! This level of air pollution can affect sensitive individuals.",
                "green")
    return wearing_mask


def display_health_update(damage, wearing_mask, aqi):
    """
    Display health update message.
    
    Args:
        damage (int): Amount of health lost
        wearing_mask (bool): Whether player wore mask
        aqi (int): Air Quality Index value
    """
    if damage == 0:
        return
    if not wearing_mask and aqi > 100:
        cprint(f"💀 The air burns your lungs. You lost {damage} health!", "red")
    elif wearing_mask and aqi > 100:
        cprint(f"😷 The mask helps, but you still lost {damage} health!", "red")
    else:
        cprint(f"💨 You lost {damage} health due to the pollution levels!", "yellow")


def play_game():
    """
    Main game loop.
    1. Initialize health and display intro.
    2. Prompt user for city input.
    3. Fetch AQI data and display mood and ASCII art.
    4. Ask about mask usage if AQI > 100.
    5. Calculate health loss or gain based on AQI and mask usage.
    6. End game if health reaches 0.
    7. Display game over message.
    """
    health = 100
    intro()

    while health > 0:
        display_health(health)
        cprint("\nWhere do you want to travel?", "cyan bold")
        city = input(" " * (console.width // 2 - 6) + ">> ").strip()

        loading_animation(f"Traveling to {city} and analyzing the air...")
        aqi = get_air_data(city)

        if aqi is None:
            cprint("⚠️ Unable to fetch data for that city. Try again.", "red")
            continue

        mood, mood_color, state = get_air_mood(aqi)
        display_city_info(city, aqi, state, (mood, mood_color))
        wearing_mask = handle_mask_choice(aqi)
        damage = health_loss(aqi, wearing_mask)
        health -= damage
        if health < 0:
            health = 0

        health = restore_health(health, aqi)
        display_health_update(damage, wearing_mask, aqi)

        time.sleep(1.5)
        print()

    cprint("\n☠️  GAME OVER! \n You have succumbed to pollution.\n", "bold red")
    cprint("The sky whispers: 'Breathe easy... in another life.'", "italic magenta")

if __name__ == "__main__":
    play_game()
