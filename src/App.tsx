import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type HistoryEntry = {
  command: string;
  output: React.ReactNode[];
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const BANNER =
  "      _ _                          __   __     \n" +
  "     | (_)                         \\ \\ / /     \n" +
  "     | |_  __ _ _   _  __ _ _ __    \\ V /_   _ \n" +
  " _   | | |/ _` | | | |/ _` | '_ \\    > <| | | |\n" +
  "| |__| | | (_| | |_| | (_| | | | |  / . \\ |_| |\n" +
  " \\____/|_|\\__,_|\\__, |\\__,_|_| |_| /_/ \\_\\__,_|\n" +
  "                 __/ |                         \n" +
  "                |___/                          \n" +
  "                                               \n" +
  "                 Happy studying Chemistry, huh?\n";

const FILES: Record<string, { size: string; content: React.ReactNode[] }> = {
  me: {
    size: "127K",
    content: [
      <div className="avatar-wrapper" key="avatar">
        <img
          src={`${process.env.PUBLIC_URL}/logo192.png`}
          alt="Jiayan Xu avatar"
          className="avatar"
        />
      </div>,
    ],
  },
  bio: {
    size: "4.0K",
    content: [
      "= Appointment",
      "+ 2023 - Present: PostDoc  Princeton University",
      "= Education",
      "+ 2019 - 2023   : Ph.D.    Queen’s University Belfast",
      "+ 2015 - 2019   : B.Eng.   East China University of Science and Technology",
    ],
  },
  research: {
    size: "12K",
    content: [
      "= Can we learn catalysis from simulations in a more *realistic* way?",
      "+ Dynamic catalyst beyond static view         10.1021/acsnano.5c04622",
      "+ Adsorbate-induced catalyst evolution        10.1021/acscatal.2c03976",
      "+ Enhanced sampling for catalytic events      10.1021/acs.jctc.1c00261",
      <div className="gallery-row" key="research-gallery">
        {[0, 1, 2].map((idx) => (
          <img
            key={idx}
            src={`${process.env.PUBLIC_URL}/research_item_${idx}.png`}
            alt={`research item ${idx + 1}`}
            className="gallery-img"
          />
        ))}
      </div>,
      "Find out more at ",
      <a
        key="research-scholar-link"
        href="https://scholar.google.com/citations?user=ue5SBQMAAAAJ&hl=en&oi=ao"
        target="_blank"
        rel="noreferrer"
        className="link"
      >
        + Google Scholar
      </a>,
      <a
        key="research-orcid-link"
        href="https://orcid.org/0000-0001-9897-5778"
        target="_blank"
        rel="noreferrer"
        className="link"
      >
        + ORCID
      </a>,
    ],
  },
  contact: {
    size: "2.1K",
    content: ["Email:  jx1279@princeton.edu", "GitHub: github.com/hsulab"],
  },
};

function App() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const lastUpdated = useMemo(
    () => new Date(document.lastModified || Date.now()),
    [],
  );

  const formatTimestamp = (date: Date) => {
    const month = MONTHS[date.getMonth()];
    const day = date.getDate().toString().padStart(2, " ");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month} ${day} ${hours}:${minutes}`;
  };

  const formatLsLine = (name: string, size: string) => {
    const timestamp = formatTimestamp(lastUpdated);
    const paddedSize = size.padStart(6, " ");
    return `-rw-r--r--@   1 jyxu  staff ${paddedSize} ${timestamp} ${name}`;
  };

  const bannerLines = useMemo(
    () => BANNER.split("\n").filter((line) => line.length > 0),
    [],
  );

  useEffect(() => {
    inputRef.current?.focus();
  });

  const fileNames = useMemo(() => Object.keys(FILES), [FILES]);

  const longestCommonPrefix = (list: string[]) => {
    if (list.length === 0) return "";
    return list.reduce((prefix, word) => {
      let i = 0;
      while (i < prefix.length && i < word.length && prefix[i] === word[i]) {
        i += 1;
      }
      return prefix.slice(0, i);
    });
  };

  const completeInput = (value: string) => {
    const trimmed = value;
    if (trimmed.startsWith("cat ")) {
      const partial = trimmed.slice(4);
      const matches = fileNames.filter((name) => name.startsWith(partial));
      if (matches.length === 1) return `cat ${matches[0]}`;
      if (matches.length > 1 && partial.length > 0) {
        const prefix = longestCommonPrefix(matches);
        if (prefix.length > partial.length) return `cat ${prefix}`;
      }
      return null;
    }

    const options = ["ls", "cat", "help", "clear", ...fileNames];
    const matches = options.filter((opt) => opt.startsWith(trimmed));
    if (matches.length === 1) return matches[0];
    if (matches.length > 1 && trimmed.length > 0) {
      const prefix = longestCommonPrefix(matches);
      if (prefix.length > trimmed.length) return prefix;
    }
    return null;
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (commandRaw: string) => {
    const command = commandRaw.trim();

    if (!command) return;

    if (command === "clear") {
      setHistory([]);
      setInput("");
      setHistoryIndex(null);
      return;
    }

    const readFile = (name: string) => {
      const file = FILES[name];
      if (file) return file.content;
      return [`cat: ${name}: No such file or directory`];
    };

    let output: React.ReactNode[] = [];

    switch (command) {
      case "help":
        output = [
          "Available commands:",
          "  ls             list files",
          "  cat <file>     show file contents",
          "  clear          clear the terminal",
          "  help           show this help",
        ];
        break;
      case "ls":
        output = Object.entries(FILES).map(([name, meta]) =>
          formatLsLine(name, meta.size),
        );
        break;
      case "cat":
        output = ["cat: missing file operand"];
        break;
      default:
        if (command.startsWith("cat ")) {
          const target = command.replace("cat ", "").trim();
          output = readFile(target);
        } else {
          output = [`Command not found: ${command}`, "Try: help"];
        }
    }

    setHistory((prev) => [...prev, { command, output }]);
    setInput("");
    setHistoryIndex(null);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleCommand(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const nextIndex =
        historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex].command);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex].command);
      }
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const next = completeInput(input);
      if (next) {
        setInput(next);
      }
    }
  };

  return (
    <div className="terminal">
      <div className="glow"></div>
      <div className="screen">
        <div className="banner" aria-hidden="true">
          {bannerLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>

        <div className="welcome">
          Login to Jiayan Xu&apos;s console. Type{" "}
          <span className="accent">help</span> to get started.
        </div>

        <div className="history" role="log" aria-live="polite">
          {history.map((entry, idx) => (
            <div className="block" key={`${entry.command}-${idx}`}>
              <div className="prompt-line">
                <span className="prompt">🐱 visitor@jiayan:~$</span>{" "}
                <span className="command-text">{entry.command}</span>
              </div>
              {entry.output.map((line, lineIdx) => (
                <div className="output-line" key={lineIdx}>
                  {line}
                </div>
              ))}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form
          className="prompt-line"
          onSubmit={onSubmit}
          aria-label="terminal input"
        >
          <label className="prompt" htmlFor="terminal-input">
            🐱 visitor@jiayan:~$
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
            className="terminal-input"
            aria-label="terminal prompt"
          />
        </form>
      </div>
    </div>
  );
}

export default App;
