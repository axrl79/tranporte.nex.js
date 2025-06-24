"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { NewEmployeeForm } from "@/components/hr/new-employee-form"
import { DocumentRenewalDialog } from "@/components/hr/document-renewal-dialog"
import { AttendanceSheet } from "@/components/hr/attendance-sheet"
import { EmployeeViewDialog } from "@/components/hr/EmployeeViewDialog"
import { EmployeeEditDialog } from "@/components/hr/EmployeeEditDialog"
import { Users, UserPlus, FileText, AlertTriangle, Loader2, Eye, Pencil } from "lucide-react"

interface Employee {
  id: string
  code: string
  fullName: string
  position: string
  type: 'conductor' | 'mecanico' | 'administrativo'
  email?: string
  phone?: string
  address?: string
  status: 'activo' | 'inactivo'
  licenseExpiry?: string
  medicalCertExpiry?: string
  createdAt: string
}

interface DocumentAlert {
  id: string
  name: string
  number?: string
  expiryDate?: string
  employee: {
    id: string
    fullName: string
  }
}

interface HRMetrics {
  totalEmployees: number
  activeEmployees: number
  drivers: number
  mechanics: number
  documentAlerts: number
  expiredDocuments: number
}

type AttendanceStatus = 'presente' | 'ausente' | 'licencia' | 'vacaciones'

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  status: AttendanceStatus
  checkIn?: string
  checkOut?: string
  notes?: string
}

export default function HRPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [hrMetrics, setHrMetrics] = useState<HRMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    drivers: 0,
    mechanics: 0,
    documentAlerts: 0,
    expiredDocuments: 0
  })
  const [documentAlerts, setDocumentAlerts] = useState<DocumentAlert[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false)
  const [showDocumentRenewal, setShowDocumentRenewal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Error al cargar empleados")
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive",
      })
      return []
    }
  }

  const fetchDocumentAlerts = async () => {
    try {
      const response = await fetch("/api/alerts?type=document_expiry&isResolved=false")
      if (!response.ok) {
        throw new Error("Error al cargar alertas")
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching document alerts:", error)
      return []
    }
  }

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch("/api/attendance")
      if (!response.ok) {
        throw new Error("Error al cargar registros de asistencia")
      }
      const data = await response.json()
      
      // Mapear los datos para incluir el nombre del empleado
      const recordsWithNames = await Promise.all(
        data.map(async (record: any) => {
          try {
            const empResponse = await fetch(`/api/employees/${record.employeeId}`)
            if (empResponse.ok) {
              const employee = await empResponse.json()
              return {
                ...record,
                employeeName: employee.fullName || `Empleado ${record.employeeId}`
              }
            }
            return {
              ...record,
              employeeName: `Empleado ${record.employeeId}`
            }
          } catch (error) {
            console.error(`Error fetching employee ${record.employeeId}:`, error)
            return {
              ...record,
              employeeName: `Empleado ${record.employeeId}`
            }
          }
        })
      )
      
      return recordsWithNames
    } catch (error) {
      console.error("Error fetching attendance records:", error)
      return []
    }
  }

  const calculateMetrics = (employees: Employee[], alerts: DocumentAlert[]): HRMetrics => {
    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === "activo").length,
      drivers: employees.filter(e => e.type === "conductor").length,
      mechanics: employees.filter(e => e.type === "mecanico").length,
      documentAlerts: alerts.length,
      expiredDocuments: employees.filter(e => 
        (e.licenseExpiry && new Date(e.licenseExpiry) < new Date()) || 
        (e.medicalCertExpiry && new Date(e.medicalCertExpiry) < new Date())
      ).length
    }
  }

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [employeesData, alertsData, attendanceData] = await Promise.all([
        fetchEmployees(),
        fetchDocumentAlerts(),
        fetchAttendanceRecords()
      ])
      
      setEmployees(employeesData)
      setDocumentAlerts(alertsData)
      setAttendanceRecords(attendanceData)
      setHrMetrics(calculateMetrics(employeesData, alertsData))
    } catch (error) {
      console.error("Error loading HR data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de RRHH",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEmployeeCreated = (newEmployee: Employee) => {
    setEmployees(prev => [newEmployee, ...prev])
    setHrMetrics(calculateMetrics([newEmployee, ...employees], documentAlerts))
    toast({
      title: "Éxito",
      description: "Empleado creado correctamente",
    })
  }

  const handleEmployeeUpdated = (updatedEmployee: Employee) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    )
    setEmployees(updatedEmployees)
    setHrMetrics(calculateMetrics(updatedEmployees, documentAlerts))
    toast({
      title: "Éxito",
      description: "Empleado actualizado correctamente",
    })
  }

  const handleDocumentRenewed = (updatedEmployee: Employee) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    )
    setEmployees(updatedEmployees)
    loadData() // Recargar todo para actualizar alertas
    toast({
      title: "Éxito",
      description: "Documento renovado correctamente",
    })
  }

  const isDocumentExpired = (expiryDate?: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isDocumentExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expiry <= thirtyDaysFromNow && expiry >= today
  }

  const getDocumentStatusColor = (expiryDate?: string) => {
    if (!expiryDate) return "bg-gray-100 text-gray-800"
    if (isDocumentExpired(expiryDate)) return "bg-red-100 text-red-800"
    if (isDocumentExpiringSoon(expiryDate)) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getDocumentStatusText = (expiryDate?: string) => {
    if (!expiryDate) return "N/A"
    if (isDocumentExpired(expiryDate)) return "Vencido"
    if (isDocumentExpiringSoon(expiryDate)) return "Por Vencer"
    return "Vigente"
  }

  const handleRenewDocument = (document: DocumentAlert) => {
    const employee = employees.find(e => e.id === document.employee.id)
    if (employee) {
      setSelectedEmployee(employee)
      setShowDocumentRenewal(true)
    }
  }

  const getAttendanceStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'presente': return 'bg-green-100 text-green-800'
      case 'ausente': return 'bg-red-100 text-red-800'
      case 'licencia': return 'bg-blue-100 text-blue-800'
      case 'vacaciones': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#0A2463] mx-auto" />
          <p className="mt-4 text-lg text-muted-foreground">Cargando datos de RRHH...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos</h1>
          <p className="text-muted-foreground">Gestión integral del personal y documentación</p>
        </div>
        <Button onClick={() => setShowNewEmployeeForm(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="attendance">Asistencias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPIs Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrMetrics.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">{hrMetrics.activeEmployees} activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conductores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrMetrics.drivers}</div>
                <p className="text-xs text-muted-foreground">personal de conducción</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mecánicos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrMetrics.mechanics}</div>
                <p className="text-xs text-muted-foreground">personal técnico</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Documentos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrMetrics.documentAlerts}</div>
                <p className="text-xs text-muted-foreground">requieren atención</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Vencer</CardTitle>
                <CardDescription>Próximos vencimientos de documentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees
                    .filter(emp => 
                      isDocumentExpiringSoon(emp.licenseExpiry) || 
                      isDocumentExpiringSoon(emp.medicalCertExpiry)
                    )
                    .slice(0, 5)
                    .map(employee => (
                      <div key={employee.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{employee.fullName}</p>
                          <p className="text-xs text-muted-foreground">{employee.position}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setShowDocumentRenewal(true)
                          }}
                        >
                          Renovar
                        </Button>
                      </div>
                    ))}
                  {employees.filter(emp => 
                    isDocumentExpiringSoon(emp.licenseExpiry) || 
                    isDocumentExpiringSoon(emp.medicalCertExpiry)
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay documentos por vencer en los próximos 30 días
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Empleados Recientes</CardTitle>
                <CardDescription>Últimas incorporaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map(employee => (
                      <div key={employee.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{employee.fullName}</p>
                          <p className="text-xs text-muted-foreground">{employee.position}</p>
                        </div>
                        <Badge variant="outline">{employee.type}</Badge>
                      </div>
                    ))}
                  {employees.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay empleados registrados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Empleados</CardTitle>
              <CardDescription>Gestión completa del personal</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length > 0 ? (
                    employees.map(employee => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-mono">{employee.code}</TableCell>
                        <TableCell className="font-medium">{employee.fullName}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.type}</Badge>
                        </TableCell>
                        <TableCell>{employee.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              employee.status === "activo" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setViewEmployee(employee)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditEmployee(employee)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No hay empleados registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control de Documentos</CardTitle>
              <CardDescription>Seguimiento de licencias y certificaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentAlerts.length > 0 ? (
                    documentAlerts.map(document => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium">{document.employee.fullName}</TableCell>
                        <TableCell>{document.name}</TableCell>
                        <TableCell>{document.number || "N/A"}</TableCell>
                        <TableCell>
                          {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getDocumentStatusColor(document.expiryDate)}>
                            {getDocumentStatusText(document.expiryDate)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRenewDocument(document)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Renovar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No hay alertas de documentos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Asistencia</CardTitle>
              <CardDescription>Historial completo de asistencias</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getAttendanceStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.checkIn || "N/A"}</TableCell>
                        <TableCell>{record.checkOut || "N/A"}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.notes || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No hay registros de asistencia
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <NewEmployeeForm
        open={showNewEmployeeForm}
        onOpenChange={setShowNewEmployeeForm}
        onEmployeeCreated={handleEmployeeCreated}
      />

      {selectedEmployee && (
        <DocumentRenewalDialog
          open={showDocumentRenewal}
          onOpenChange={setShowDocumentRenewal}
          employee={selectedEmployee}
          onDocumentRenewed={handleDocumentRenewed}
        />
      )}

      {viewEmployee && (
        <EmployeeViewDialog
          open={!!viewEmployee}
          onOpenChange={() => setViewEmployee(null)}
          employee={viewEmployee}
        />
      )}

      {editEmployee && (
        <EmployeeEditDialog
          open={!!editEmployee}
          onOpenChange={() => setEditEmployee(null)}
          employee={editEmployee}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}
    </div>
  )
}