hi
# TPH Calculator in MFC
Used in TAC Dynamics 泰科動力
## Overview
This tool is used to calculate efficiency based on warehouse configuration and robot speed. It will also reccommend the most cost effective option for optimal warehouse Throughput per Hour (TPH).

## Features
- Customisable Storage Setting (Length *Breadth *Height)
- Customisable port location (Current Limitation: available only on x=0 axis)
- Customisable Container(s) Location with ability to generate random storage
- Customisable Robot configuration along with starting point
- Customisable Picking List plus randomness

## Calculation Model
The tool uses a **simplified single-robot time model**, broken into the following components:

| Step      | Description                                                           |
|-----------|-----------------------------------------------------------------------|
| **M1**    | Time spent moving from  to blocking, if needed   |
| **R**     | Time spent relocating blocking container(s), if needed                |
| **M2**    | Time spent moving from robot position to intended container      |
| **Outbound** | Time spent moving the intended container to the port       |
| **Ws**    | Time spent at the port                                         |
| **Inbound** | Time spent returning to original container's position          |

TPH for 1 robot is calculated through the formula:
$$\text{TPH} \approx \dfrac{3600}{\text{(Total relocate time} + \text{Total time)/pick count + port time}} \times \text{port count (if required)}$$
- **3600**: 1 hour in seconds
- **Total relocate time:** total time spent on relocating for the system. This time includes M1 (to blocking containers) and R.
- **Total time:** total base time spent on actual picks *excluding* relocate phase. This time includes M2 Outbound and Inbound.
- **pick count:** number of picks done.
- **port time:** time spent on port for each pick.

///Need clarification
- **port count:** exists only if port time > **port count -1 (need cfm)** * average time spent on M1+ R+ M2+ Outbound+ Inbound, else ```port count = 1```. If time spent on WS is too long, robot has enough time to move another container, thus increasing TPH by no. of ports.

{Math.ceil((((relocate_time + time / 2) / pick_number) - inboundclash_t) / work_t) * ws_number}

$$\text{Reccomended No. of Robots = }$$

This model calculates the average time spent on 1 pick and estimates TPH and recommended number of robots.

