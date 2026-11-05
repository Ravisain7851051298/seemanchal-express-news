const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/team
// @desc    Get all approved team members and reporters for the public Team Page
router.get('/', async (req, res) => {
  try {
    const members = await User.find({
      status: 'approved',
      showOnTeamPage: true,
    })
      .select('name photo assignedDesignation committeeLevel assignedLocation bio role createdAt')
      .sort({ createdAt: 1 });

    // Hierarchy groupings
    const hierarchy = {
      National: {
        title: 'A. National Executive Committee',
        description: 'Apex national leadership steering strategic vision, governance, and institutional policies.',
        members: [],
      },
      State: {
        title: 'B. State Executive Committee (Bihar)',
        description: 'State leadership managing regional operations, chapters, and statewide representation.',
        members: [],
      },
      District: {
        title: 'C. District Executive Committee',
        description: 'District level committees driving local engagement across Kishanganj, Purnea, Katihar, and Araria.',
        members: [],
      },
      Block: {
        title: 'D. Block / Taluka Committee',
        description: 'Block level coordinators facilitating grassroot initiatives and community outreach.',
        members: [],
      },
      Panchayat: {
        title: 'E. Gram Panchayat Committee',
        description: 'Panchayat leaders and youth coordinators connecting village communities.',
        members: [],
      },
      Ward: {
        title: 'F. Ward Committee',
        description: 'Ward representatives and local volunteers active at the neighborhood level.',
        members: [],
      },
      Press: {
        title: 'Editorial & Field Reporting Team',
        description: 'Accredited journalists, district bureau chiefs, and ground correspondents of Seemanchal Express.',
        members: [],
      },
    };

    members.forEach((m) => {
      if (m.role === 'reporter') {
        hierarchy.Press.members.push(m);
      } else if (hierarchy[m.committeeLevel]) {
        hierarchy[m.committeeLevel].members.push(m);
      } else {
        hierarchy.National.members.push(m);
      }
    });

    res.json({
      success: true,
      totalCount: members.length,
      hierarchy,
      allMembers: members,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
