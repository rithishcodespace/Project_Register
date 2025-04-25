import React from 'react';

const team = [
  {
    name: 'Alice Johnson',
    email: 'alice@gmail.com',
    regNo: 'REG001',
    cluster: 'Cluster A',
    isLead: true,
  },
  {
    name: 'Nike Brown',
    email: 'nike@gmail.com',
    regNo: 'REG002',
    cluster: 'Cluster A',
    isLead: false,
  },
  {
    name: 'Mathan Kumar',
    email: 'mathan@gmail.com',
    regNo: 'REG003',
    cluster: 'Cluster A',
    isLead: false,
  },
  {
    name: 'Prakash Singh',
    email: 'prakash@gmail.com',
    regNo: 'REG004',
    cluster: 'Cluster A',
    isLead: false,
  },
];

function Student_Team() {
  return (
    <div className="p-6 bg-gradient-to-br min-h-60 ">
      <h1 className="text-3xl font-bold text-purple-500 text-center mb-8">
        Team Information
      </h1>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-5">
        {team.map((member, index) => (
          <div
            key={index}
            className="flex flex-col  bg-white sm:flex-row sm:items-center justify-between border-b py-4"
          >
            <div>
              <p className="text-lg bg-white  font-semibold text-gray-800">
                {member.name}{' '}
                {member.isLead && (
                  <span className="text-sm bg-white  text-yellow-500 font-bold ml-2">
                    👑 Team Lead
                  </span>
                )}
              </p>
              <p className="text-sm bg-white  text-gray-600">{member.email}</p>
            </div>
            <div className="text-sm text-gray-700 mt-2 sm:mt-0">
              <p className=' bg-white '>
                Reg No: <span className=" bg-white font-medium">{member.regNo}</span>
              </p>
              <p className=' bg-white '>
                Cluster: <span className=" bg-white font-medium">{member.cluster}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Student_Team;
