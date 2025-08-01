# TPH Calculator for MFC
Used in TAC Dynamics 泰科動力
## Overview
This tool is used to calculate efficiency based on warehouse configuration and robot speed. It will also reccommend the most cost effective option for optimal warehouse Throughput per Hour (TPH).

## Features
- Customisable Layout (Length *Breadth *Height)
- Customisable port location (Current Limitation: available only on x=0 and y=0 axis)
- Customisable Container(s) Location with ability to generate random storage
- Customisable Robot configuration and its starting point
- Customise picking sequence with ability to randomise and sorted (Best Case)
- Ability to Smart Relocate blocking containers

## Calculation Model
The tool uses a **simplified single-robot time model**, broken into the following components:

| Step      | Description                                                           |
|-----------|-----------------------------------------------------------------------|
| **M1**    | Average Time spent moving from  to blocking, if needed   |
| **R**     | Average Time spent relocating blocking container(s), if needed                |
| **M2**    | Average Time spent moving from robot's position to intended container      |
| **Outbound** | Average Time spent moving the intended container to nearest port       |
| **Ws**    | Average Time an operator spends at a port                                         |
| **Inbound** | Average Time spent returning to  container's original position          |

TPH for 1 robot is calculated through the formula:
$$\text{TPH} \approx \dfrac{3600}{\text{(Total Relocate Time} + \text{Total Useful Time)/pick count + port time}} \times \text{port multiplier (if required)}$$
- **3600**: 1 hour in seconds
- **Total relocate time:** total time spent on relocating for the system. This time includes M1 (to blocking containers) and R.
- **Total time:** total base time spent on actual picks *excluding* relocating phase. This time includes M2,Outbound and Inbound.
- **pick count:** number of picks done.
- **port time:** time spent on port for each pick.

- **port multiplier:** exists only if ```port time > T``` where T = [(no. of port - 1) * average time spent on M1+ R+ M2+ Outbound+ Inbound]. 

| No. of Port(s) | Port Time  | Port Multiplier         |
|----------------|------------|--------------------|
| 1              | -          |       1            |
| 2              | ≥1T       |       2            |
| 3              | ≥2T       |       3            |
| 4              | ≥3T       |       4            |
| ...            | ...        |      ...           |

This means the robot has enough time to move another container, thus increasing TPH by its multiplier.

--- 
$$
\text{Recommended No. of Robot(s)=}\left\lceil
\frac{
\left( {\text{Total Relocate Time} + {\text{Total Useful Time}}} \right)/\text{pick number}
}{
\text{work time+\text{inbound clash time}}
}
\right\rceil
\times \text{no. of port(s)}
$$

Estimating new TPH:
$$
\text{New TPH} \approx
\left[
\frac{3600 - (\text{Relocate Time} + \text{Outbound Time} + \text{Work Time})}
{\text{Work Time} + \text{Inbound Clash Time}} + 1
\right]
\times \text{No. of Port(s)}
$$


<pre> |M1|R|M2|Out|Ws| 
                |clash_in|Ws| 
                            |clash_in|Ws|...
                                         ...|clash_in|Ws|
⟨───────────────────────── 1h ───────────────────────────⟩
                                         </pre>
---
## Relocation Method
There are 2 methods for relocation:
#### 1. Smart Relocation
To reduce future relocation, containers are relocated to stacks with available spaces that are least likely to interfere with upcoming picks, as determined by analysing the picking list.

#### 2. Random Relocation
Containers are randomly relocated to a stack to its highest possible position.

---
# Installation Guide

1. Download and install [Node.js](https://nodejs.org/zh-tw/download)
2. Clone repository
```
git clone https://github.com/hjcian/tph-calculator.git
cd tph-calculator
```
3. Install dependencies
```
npm install
```
4. Run App Locally 
Build App:
``` 
npm run build
```
For preview (http://localhost:4173/):
```
npm run preview
```
For development (http://localhost:5173/):
```
npm run dev
```


# Technical Documents
For technical documents, refer to [README.md](src\README.md)

Simplified Code structure:

```
TPH-Calculator/

├── src/                          # Source code
│   ├── assets/                   # Images, logos, or static resources
│   ├── components/               # Reusable UI components (e.g., AntSwitch, Dialogs)
│   ├── pages/                    # Page-level components (e.g., Home, Orders, Slot)
│   ├── styles/                   # Global styles, theme settings (CSS/SCSS/StyledComponents)
│   ├── App.jsx                   
│   ├── App.css                   
│   ├── main.jsx                  # React app entry point
│   ├── index.css                 # Base styling
│   └── README.md                 # Software ReadME
│
├── README.md                     # Overall Project overview
```