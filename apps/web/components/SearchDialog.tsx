"use client";

import { Cross2Icon, MagnifyingGlassIcon, VercelLogoIcon } from "@radix-ui/react-icons";
import { Dialog, DialogClose, DialogContent, Button, Input } from "@repo/ui";
import { useEffect, useRef, useState } from "react";
import { Track, Problem } from "@prisma/client";
import { TrackList } from "./TrackList";
import Link from "next/link";
import { MdOutlineKeyboardVoice } from "react-icons/md";

export function SearchDialog({ tracks }: { tracks: (Track & { problems: Problem[] })[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [searchTracks, setSearchTracks] = useState(tracks);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const [bounce, setBounce] = useState(false);

  function handleCLick() {
    setBounce(true);
    setTimeout(() => {
      setBounce(false);
    }, 4000);
  }
  function handleSpeech() {
    const Speechrecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Speechrecognition();
    recognition.start();
    recognition.onresult = async function (event) {
      const voiceData = event.results && event.results[0] && event.results[0][0] && event.results[0][0].transcript;
      console.log(voiceData);
      setInput(voiceData || "");
    };
  }

  function handleFunction() {
    handleSpeech();
    handleCLick();
  }

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "KeyK" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setDialogOpen(true);
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, searchTracks.length - 1));
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (event.code === "Enter" && selectedIndex !== -1) {
        event.preventDefault();
        document.getElementById(`track-link-${selectedIndex}`)?.click();
      }
      if (event.code === "ArrowDown" || event.code === "ArrowUp") {
        event.preventDefault();
        const container = scrollableContainerRef.current;
        if (container) {
          if (selectedIndex > 3) {
            const scrollAmount = event.code === "ArrowDown" ? 85 : -80;
            container.scrollBy({ top: scrollAmount, behavior: "smooth" });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [searchTracks, selectedIndex]);

  useEffect(() => {
    const foundTracks = tracks.filter((track) => {
      return (
        track.title.toLowerCase().includes(input.toLowerCase()) ||
        track.description.toLowerCase().includes(input.toLowerCase())
      );
    });
    setSearchTracks(foundTracks);
    setSelectedIndex(-1);
  }, [input]);

  useEffect(() => {
    const isMacOS = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    setShortcut(isMacOS ? "Cmd K" : "Ctrl K");
  }, []);

  function handleClose(open: boolean) {
    if (!open) setDialogOpen(false);
    setInput("");
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleClose}>
      <Button variant="outline" className="pr-2" onClick={() => setDialogOpen(true)}>
        <div className="items-center hidden gap-2 md:flex">
          <MagnifyingGlassIcon className="h-[1.2rem] w-[1.2rem]" />
          Search...
          <kbd className="bg-white/15 p-1.5 rounded-sm text-xs leading-3">{shortcut}</kbd>
        </div>
        <div className="block md:hidden">
          <MagnifyingGlassIcon className="h-[1.2rem] w-[1.2rem]" />
        </div>
      </Button>
      <DialogContent className="max-w-2xl gap-0 p-0 ">
        <div className="flex items-center px-4 py-2 border-b">
          <MagnifyingGlassIcon className="h-[1.5rem] w-[1.5rem] " />
          <MdOutlineKeyboardVoice
            onClick={handleFunction}
            className={`pl-2 h-[2.2rem] w-[2.2rem] cursor-pointer fill-white ${bounce ? "animate-bounce" : " "}  `}
          />
          <Input
            type="text"
            placeholder="Type title"
            className="text-base border-none shadow-none focus-visible:outline-none focus-visible:ring-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <DialogClose>
            <Cross2Icon className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <div className="h-[400px] overflow-y-scroll" ref={scrollableContainerRef}>
          {searchTracks.map((track, index) => (
            <div key={track.id} className={`p-2 ${index === selectedIndex ? "bg-blue-600/20" : ""}`}>
              <Link href={`/tracks/${track.id}`} passHref>
                <p id={`track-link-${index}`} tabIndex={-1} style={{ display: "none" }}>
                  Navigate
                </p>
              </Link>
              <TrackList track={track} />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
