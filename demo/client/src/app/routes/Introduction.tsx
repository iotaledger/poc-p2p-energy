import { Heading } from "iota-react-components";
import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Component which will show information about the demonstration.
 */
class Introduction extends Component<any, any> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <React.Fragment>
                <Heading level={1}>Introduction</Heading>
                <p>Although the supply of energy is often automated, the payment system still requires a high cost to integrate
                    and manual intervention along the way. By creating a peer-to-peer energy grid with IOTA, we can automate the
                     transfer of power and the payment for that power, allowing for more dynamic changes to infrastructure such
                      as distribution and costing.</p>
                <p>The presented PoC demonstrates how the entities of a peer-to-peer (P2P) energy grid can trade energy, by both
                     supplying power and receiving payment for it. The distributed and machine-based nature of the P2P energy grid
                      make this an ideal use case for IOTA. Using IOTA technologies we can develop a solution that creates an infrastructure
                       where even low-powered devices can communicate with the grid in a traceable and immutable fashion.</p>
                <p>IOTA is an ideal candidate to implement this PoC because it's feeless, scalable, and designed to work with the M2M economy.</p>
                <p>To see the demonstration in action visit the <Link className="link" to="/grid">Grid</Link> page to load an existing grid or create a new one.</p>
                <hr />
                <p>To find out more details on how this was implemented, please read the Blueprint on the docs
                site <a href="https://docs.iota.org/docs/blueprints/0.1/p2p-energy/overview" target="_blank" rel="noopener noreferrer">P2P Energy Grid Blueprint</a> or
                view the source code on <a href="https://github.com/iotaledger/poc-p2p-energy" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
            </React.Fragment >
        );
    }
}

export default Introduction;
