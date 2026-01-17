
import cv2
import numpy as np
import mido
from mido import Message, MidiFile, MidiTrack
import sys
import os
import wave

def image_to_midi(image_path, output_path='output.mid', duration_sec=15, min_note=48, max_note=84):
    """
    Converts an image (chalk drawing) to a MIDI file.
    """
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print("Error: Could not decode image.")
        return

    edges = cv2.Canny(img, 100, 200)
    data = edges
    height, width = data.shape

    mid = MidiFile()
    track = MidiTrack()
    mid.tracks.append(track)

    total_ticks = duration_sec * 960
    ticks_per_col = max(1, int(total_ticks / width))
    
    pending_time = 0
    previous_notes = set()
    
    for x in range(width):
        col = data[:, x]
        active_rows = np.where(col > 0)[0]
        
        current_notes = set()
        for y in active_rows:
            normalized_h = 1.0 - (y / height)
            note_num = int(min_note + (normalized_h * (max_note - min_note)))
            current_notes.add(note_num)
            
        notes_to_on = current_notes - previous_notes
        notes_to_off = previous_notes - current_notes
        
        pending_time += ticks_per_col
        
        if notes_to_off or notes_to_on:
            for note in notes_to_off:
                track.append(Message('note_off', note=note, velocity=64, time=pending_time))
                pending_time = 0 
                
            for note in notes_to_on:
                track.append(Message('note_on', note=note, velocity=64, time=pending_time))
                pending_time = 0
                
        previous_notes = current_notes

    if previous_notes:
        pending_time += ticks_per_col
        for note in previous_notes:
            track.append(Message('note_off', note=note, velocity=64, time=pending_time))
            pending_time = 0

    mid.save(output_path)
    print(f"Success: '{image_path}' ({width}x{height}) -> '{output_path}' ({duration_sec}s)")

def image_to_wave(image_path, output_path='output.wav', duration_sec=15, min_note=48, max_note=84):
    """
    Synthesizes an audio file (WAV) directly from the image.
    """
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    print(f"Processing image for audio synthesis...")
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print("Error: Could not decode image.")
        return

    # Preprocessing
    edges = cv2.Canny(img, 100, 200)
    data = edges
    height, width = data.shape

    # Audio parameters
    sample_rate = 44100
    total_samples = int(duration_sec * sample_rate)
    samples_per_col = int(total_samples / width)
    
    # Initialize master buffer
    # We'll build it in chunks to save memory, but for 15s it fits in RAM easily.
    # float32 for processing, convert to int16 for write
    full_audio = np.zeros(total_samples, dtype=np.float32)

    print(f"Synthesizing audio ({duration_sec}s, {sample_rate}Hz)...")
    
    # Pre-calculate frequencies for all potential note rows to save time
    # This is an optimization. Instead of calc freq inside loop, we map row Y to freq.
    # But note calculation depends on range.
    
    # Time array for the whole duration to ensure phase continuity
    # t = np.linspace(0, duration_sec, total_samples, endpoint=False)
    
    # Optimization: Only generate waves for active frequencies in each column
    # To ensure phase continuity, we pass the absolute start time of the chunk.
    
    current_sample_idx = 0
    
    for x in range(width):
        col = data[:, x]
        active_rows = np.where(col > 0)[0]
        
        if len(active_rows) == 0:
            current_sample_idx += samples_per_col
            continue
            
        # Determine duration of this slice
        # The last slice might need to be trimmed if rounding errors occur, but simplistic approach first
        chunk_len = samples_per_col
        if current_sample_idx + chunk_len > total_samples:
            chunk_len = total_samples - current_sample_idx
            
        if chunk_len <= 0:
            break

        # Time vector for this chunk
        start_time = current_sample_idx / sample_rate
        t_chunk = np.linspace(start_time, start_time + (chunk_len / sample_rate), chunk_len, endpoint=False)
        
        chunk_signal = np.zeros(chunk_len, dtype=np.float32)
        
        # Add sine waves for each active pixel
        # Normalize amplitude by number of active notes to prevent clipping? 
        # Or just hard clip later. Soft scaling is safer.
        cnt = 0
        for y in active_rows:
            normalized_h = 1.0 - (y / height)
            note_num = min_note + (normalized_h * (max_note - min_note))
            freq = 440.0 * (2.0 ** ((note_num - 69.0) / 12.0))
            
            # Simple Sine
            chunk_signal += np.sin(2.0 * np.pi * freq * t_chunk)
            cnt += 1
        
        # Normalize chunk? If we normalize per chunk, volume will fluctuate wildly.
        # Better to just add and normalize the whole thing at the end.
        
        full_audio[current_sample_idx : current_sample_idx + chunk_len] = chunk_signal
        current_sample_idx += chunk_len
        
        if x % 100 == 0:
            print(f"Rendering: {int(x/width*100)}%", end='\r')

    print("Rendering: 100%")

    # Normalize entire buffer
    max_val = np.max(np.abs(full_audio))
    if max_val > 0:
        full_audio = full_audio / max_val
        # Reduce volume slightly to be safe
        full_audio = full_audio * 0.9

    # Convert to 16-bit PCM
    audio_int16 = (full_audio * 32767).astype(np.int16)

    # Write WAV
    with wave.open(output_path, 'w') as wav_file:
        wav_file.setnchannels(1) # Mono
        wav_file.setsampwidth(2) # 2 bytes per sample (16-bit)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int16.tobytes())
        
    print(f"Success: '{image_path}' -> '{output_path}'")


def play_audio(file_path):
    """
    Plays an audio file (MIDI or WAV) using pygame.
    """
    try:
        import pygame
        print(f"Playing '{file_path}'...")
        pygame.init()
        pygame.mixer.init()
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        
        # Keep script running while music plays
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
            
    except ImportError:
        print("Error: pygame is not installed. Please run 'pip install pygame'.")
    except Exception as e:
        print(f"Error playing audio: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py <image_path> [output_path] [duration_sec] [--play]")
    else:
        input_img = sys.argv[1]
        
        # Default values
        output_path = "output.mid"
        duration = 15.0
        should_play = False
        
        # Parse arguments manually
        args = sys.argv[2:]
        
        if "--play" in args:
            should_play = True
            args.remove("--play")
            
        if len(args) > 0:
            output_path = args[0]
        if len(args) > 1:
            try:
                duration = float(args[1])
            except ValueError:
                pass 

        # Decide generator based on extension
        ext = os.path.splitext(output_path)[1].lower()
        if ext in ['.wav', '.mp3']:
            # If user asked for mp3, we'll force wav but might name it wav if we want to be strict,
            # but user asked for mp3 file. Writing WAV data to .mp3 extension is bad practice.
            # I will force .wav extension if they asked for mp3, and warn.
            if ext == '.mp3':
                print("Warning: Direct MP3 encoding requires external libraries (ffmpeg). Generating .wav instead.")
                output_path = os.path.splitext(output_path)[0] + ".wav"
            
            image_to_wave(input_img, output_path, duration_sec=duration)
        else:
            # Default to MIDI
            image_to_midi(input_img, output_path, duration_sec=duration)
        
        if should_play:
            play_audio(output_path)